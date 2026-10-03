/*
 * Minimal GLB (binary glTF 2.0) loader and renderer.
 * Models are cached per URL and displayed in their static pose.
 */

const cache = new Map();

export function loadGlb(url, onProgress) {
  if (!cache.has(url)) {
    const listeners = new Set();
    const entry = { listeners, promise: null };

    entry.promise = (async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Couldn’t download the model (HTTP ${res.status}).`);
      }

      const total = Number(res.headers.get('content-length')) || 0;
      let buf;

      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        const parts = [];
        let got = 0;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value);
          got += value.length;
          for (const listener of listeners) {
            listener(total ? got / total : null);
          }
        }

        const all = new Uint8Array(got);
        let offset = 0;
        for (const part of parts) {
          all.set(part, offset);
          offset += part.length;
        }
        buf = all.buffer;
      } else {
        buf = await res.arrayBuffer();
      }

      for (const listener of listeners) listener(1);

      const head = new Uint8Array(buf, 0, 4);
      const isGlb =
        head[0] === 0x67 &&
        head[1] === 0x6c &&
        head[2] === 0x54 &&
        head[3] === 0x46;

      return isGlb
        ? parseGlb(buf)
        : parseGltfJson(new TextDecoder().decode(buf));
    })();

    cache.set(url, entry);
    entry.promise.catch(() => cache.delete(url));
  }

  const entry = cache.get(url);
  if (onProgress) entry.listeners.add(onProgress);
  return entry.promise.finally(() => {
    if (onProgress) entry.listeners.delete(onProgress);
  });
}

export async function parseGltfJson(text) {
  const json = JSON.parse(text);
  const uri = json.buffers?.[0]?.uri || '';
  const match = uri.match(/^data:[^,]*;base64,(.*)$/);

  if (!match) {
    throw new Error('This glTF file needs its data embedded to be shown here.');
  }

  const b64 = match[1];
  const bin = new Uint8Array(Math.floor((b64.length * 3) / 4));
  let offset = 0;
  const chunkSize = 1 << 20;

  for (let i = 0; i < b64.length; i += chunkSize) {
    const part = atob(b64.slice(i, i + chunkSize));
    for (let k = 0; k < part.length; k += 1) {
      bin[offset++] = part.charCodeAt(k);
    }
  }

  return finishParse(json, bin.subarray(0, offset));
}

export async function parseGlb(buf) {
  const dv = new DataView(buf);

  if (dv.getUint32(0, true) !== 0x46546c67) {
    throw new Error('This file isn’t a GLB model.');
  }

  let off = 12;
  let json = null;
  let bin = null;

  while (off < dv.byteLength) {
    const len = dv.getUint32(off, true);
    const type = dv.getUint32(off + 4, true);
    const start = off + 8;

    if (type === 0x4e4f534a) {
      json = JSON.parse(
        new TextDecoder().decode(new Uint8Array(buf, start, len)),
      );
    } else if (type === 0x004e4942) {
      bin = new Uint8Array(buf, start, len);
    }

    off = start + len;
  }

  if (!json || !bin) throw new Error('The GLB file is incomplete.');
  return finishParse(json, bin);
}

async function finishParse(json, bin) {
  if (
    (json.extensionsRequired || []).some(
      (extension) =>
        extension === 'KHR_draco_mesh_compression' ||
        extension === 'EXT_meshopt_compression',
    )
  ) {
    throw new Error(
      'This model uses compressed geometry, which this viewer doesn’t support yet.',
    );
  }

  const viewBytes = (i) => {
    const bv = json.bufferViews[i];
    return bin.subarray(
      bv.byteOffset || 0,
      (bv.byteOffset || 0) + bv.byteLength,
    );
  };

  const images = await Promise.all(
    (json.images || []).map(async (im) => {
      try {
        if (im.bufferView == null) return null;

        const blob = new Blob([viewBytes(im.bufferView)], {
          type: im.mimeType || 'image/jpeg',
        });

        if (typeof createImageBitmap === 'function') {
          return await createImageBitmap(blob);
        }

        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await img.decode();
        return img;
      } catch {
        return null;
      }
    }),
  );

  return {
    json,
    bin,
    images,
    viewBytes,
    credit: json.asset?.extras || null,
  };
}

const ident = () =>
  new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);

function mul(a, b) {
  const out = new Float32Array(16);

  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) {
        sum += a[k * 4 + r] * b[c * 4 + k];
      }
      out[c * 4 + r] = sum;
    }
  }

  return out;
}

function trs(t = [0, 0, 0], q = [0, 0, 0, 1], s = [1, 1, 1]) {
  const [x, y, z, w] = q;
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;

  return new Float32Array([
    (1 - 2 * (yy + zz)) * s[0],
    2 * (xy + wz) * s[0],
    2 * (xz - wy) * s[0],
    0,
    2 * (xy - wz) * s[1],
    (1 - 2 * (xx + zz)) * s[1],
    2 * (yz + wx) * s[1],
    0,
    2 * (xz + wy) * s[2],
    2 * (yz - wx) * s[2],
    (1 - 2 * (xx + yy)) * s[2],
    0,
    t[0], t[1], t[2], 1,
  ]);
}

const xform = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];

const VS = `
attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUV;
uniform mat4 uVP; uniform mat4 uModel;
varying vec3 vPos; varying vec3 vNor; varying vec2 vUV;
void main(){
  vec4 wp=uModel*vec4(aPos,1.0);
  vPos=wp.xyz; vNor=mat3(uModel)*aNor; vUV=aUV;
  gl_Position=uVP*wp;
}`;

const FS = `
precision mediump float;
varying vec3 vPos; varying vec3 vNor; varying vec2 vUV;
uniform vec3 uEye; uniform vec4 uBase; uniform float uHasTex; uniform sampler2D uTex;
uniform float uMetal; uniform float uRough; uniform vec3 uEmissive; uniform float uCoat;
uniform float uAlphaMode; uniform float uCutoff;
uniform vec3 uSky; uniform vec3 uFloor; uniform vec3 uRim;
vec3 toLin(vec3 c){ return pow(c, vec3(2.2)); }
void main(){
  vec4 base=uBase;
  if(uHasTex>0.5){ vec4 t=texture2D(uTex,vUV); base*=vec4(toLin(t.rgb),t.a); }
  if(uAlphaMode>0.5 && uAlphaMode<1.5 && base.a<uCutoff) discard;
  vec3 N=normalize(vNor); vec3 V=normalize(uEye-vPos);
  if(dot(N,V)<0.0) N=-N;
  vec3 L=normalize(vec3(0.35,0.9,0.45)); vec3 L2=normalize(vec3(-0.6,0.35,-0.7));
  float ndl=max(dot(N,L),0.0); float ndl2=max(dot(N,L2),0.0);
  float nv=max(dot(N,V),0.0);
  float rough=clamp(uRough,0.04,1.0);
  float shin=mix(256.0,6.0,rough);
  float spec=pow(max(dot(N,normalize(L+V)),0.0),shin)*(1.0-rough*0.85);
  vec3 R=reflect(-V,N);
  vec3 sky=toLin(uSky); vec3 flo=toLin(uFloor);
  vec3 env=mix(flo,sky,smoothstep(-0.25,0.4,R.y));
  env+=vec3(1.0)*exp(-pow((R.y-0.2)*8.0,2.0))*0.9;
  vec3 F0=mix(vec3(0.04),base.rgb,uMetal);
  float fres=pow(1.0-nv,5.0);
  vec3 F=F0+(1.0-F0)*fres;
  vec3 diffuse=base.rgb*(1.0-uMetal)*(0.12+0.85*ndl+0.25*ndl2);
  vec3 refl=env*F*(1.0-rough*0.8);
  float coatF=0.04+0.96*fres;
  vec3 col=diffuse+refl+vec3(spec)*(0.6+uMetal)+env*coatF*uCoat*0.6;
  col+=toLin(uRim)*pow(1.0-nv,3.0)*0.35;
  col+=uEmissive;
  col=col/(col+vec3(0.85))*1.6;
  float a=uAlphaMode>1.5 ? base.a : 1.0;
  gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),a);
}`;

function compile(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'shader');
  }

  return shader;
}

export function createGlbScene(gl, parsed) {
  const { json, images, viewBytes } = parsed;
  const uint32 = !!gl.getExtension('OES_element_index_uint');

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || 'link');
  }

  const glBuffers = new Map();

  const bufferFor = (viewIndex, target) => {
    const key = `${viewIndex}:${target}`;

    if (!glBuffers.has(key)) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(target, buffer);
      gl.bufferData(target, viewBytes(viewIndex), gl.STATIC_DRAW);
      glBuffers.set(key, buffer);
    }

    return glBuffers.get(key);
  };

  const glTextures = new Map();

  const textureFor = (texIndex) => {
    if (glTextures.has(texIndex)) return glTextures.get(texIndex);

    const tex = json.textures?.[texIndex];
    const img = tex ? images[tex.source] : null;
    let texture = null;

    if (img) {
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        img,
      );

      const pot = (n) => (n & (n - 1)) === 0;
      const sampler = json.samplers?.[tex.sampler] || {};

      if (pot(img.width) && pot(img.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR,
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_S,
          sampler.wrapS || gl.REPEAT,
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_T,
          sampler.wrapT || gl.REPEAT,
        );
      } else {
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR,
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_S,
          gl.CLAMP_TO_EDGE,
        );
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_T,
          gl.CLAMP_TO_EDGE,
        );
      }

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    glTextures.set(texIndex, texture);
    return texture;
  };

  const draws = [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  const visit = (ni, parent) => {
    const node = json.nodes[ni];
    const local = node.matrix
      ? new Float32Array(node.matrix)
      : trs(node.translation, node.rotation, node.scale);

    const world = mul(parent, local);

    if (node.mesh != null) {
      for (const primitive of json.meshes[node.mesh].primitives) {
        if (
          (primitive.mode ?? 4) !== 4 ||
          primitive.attributes.POSITION == null
        ) {
          continue;
        }

        const pos = json.accessors[primitive.attributes.POSITION];

        if (pos.min && pos.max) {
          for (let c = 0; c < 8; c += 1) {
            const corner = [
              c & 1 ? pos.max[0] : pos.min[0],
              c & 2 ? pos.max[1] : pos.min[1],
              c & 4 ? pos.max[2] : pos.min[2],
            ];

            const transformed = xform(world, corner);

            for (let k = 0; k < 3; k += 1) {
              min[k] = Math.min(min[k], transformed[k]);
              max[k] = Math.max(max[k], transformed[k]);
            }
          }
        }

        const idx =
          primitive.indices != null
            ? json.accessors[primitive.indices]
            : null;

        if (idx && idx.componentType === 5125 && !uint32) continue;

        const material = json.materials?.[primitive.material] || {};
        const pbr = material.pbrMetallicRoughness || {};
        const alphaMode =
          material.alphaMode === 'MASK'
            ? 1
            : material.alphaMode === 'BLEND'
              ? 2
              : 0;

        draws.push({
          world,
          prim: primitive,
          idx,
          material: {
            base: pbr.baseColorFactor || [1, 1, 1, 1],
            tex: pbr.baseColorTexture
              ? pbr.baseColorTexture.index
              : null,
            metal: pbr.metallicFactor ?? 1,
            rough: pbr.roughnessFactor ?? 1,
            emissive: material.emissiveFactor || [0, 0, 0],
            coat:
              material.extensions?.KHR_materials_clearcoat
                ?.clearcoatFactor || 0,
            alphaMode,
            cutoff: material.alphaCutoff ?? 0.5,
          },
        });
      }
    }

    for (const child of node.children || []) visit(child, world);
  };

  const scene = json.scenes?.[json.scene ?? 0] || {
    nodes: json.nodes.map((_, i) => i),
  };

  for (const ni of scene.nodes) visit(ni, ident());

  if (!draws.length || !Number.isFinite(min[0])) {
    throw new Error('No displayable geometry was found in this model.');
  }

  const ex = max[0] - min[0];
  const ez = max[2] - min[2];
  const alongZ = ez > ex;
  const length = Math.max(ex, ez);
  const scale = 3.64 / length;
  const cx = (min[0] + max[0]) / 2;
  const cz = (min[2] + max[2]) / 2;

  let norm = mul(
    trs([0, 0, 0], [0, 0, 0, 1], [scale, scale, scale]),
    trs([-cx, -min[1], -cz]),
  );

  if (alongZ) {
    norm = mul(
      trs([0, 0, 0], [0, Math.SQRT1_2, 0, Math.SQRT1_2]),
      norm,
    );
  }

  for (const draw of draws) {
    draw.model = mul(norm, draw.world);
  }

  const height = (max[1] - min[1]) * scale;

  draws.sort(
    (a, b) =>
      (a.material.alphaMode === 2) - (b.material.alphaMode === 2),
  );

  const loc = {
    aPos: gl.getAttribLocation(prog, 'aPos'),
    aNor: gl.getAttribLocation(prog, 'aNor'),
    aUV: gl.getAttribLocation(prog, 'aUV'),
  };

  const U = {};

  for (const name of [
    'uVP',
    'uModel',
    'uEye',
    'uBase',
    'uHasTex',
    'uTex',
    'uMetal',
    'uRough',
    'uEmissive',
    'uCoat',
    'uAlphaMode',
    'uCutoff',
    'uSky',
    'uFloor',
    'uRim',
  ]) {
    U[name] = gl.getUniformLocation(prog, name);
  }

  const bindAttr = (location, accessorIndex, fallback) => {
    if (location < 0) return;

    if (accessorIndex == null) {
      gl.disableVertexAttribArray(location);
      gl.vertexAttrib4fv(location, fallback);
      return;
    }

    const accessor = json.accessors[accessorIndex];
    const bv = json.bufferViews[accessor.bufferView];
    const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[
      accessor.type
    ];

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      bufferFor(accessor.bufferView, gl.ARRAY_BUFFER),
    );

    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(
      location,
      size,
      accessor.componentType,
      !!accessor.normalized,
      bv.byteStride || 0,
      accessor.byteOffset || 0,
    );
  };

  return {
    height,
    length: 3.64,
    credit: parsed.credit,

    draw(vp, eye, colors) {
      gl.useProgram(prog);
      gl.uniformMatrix4fv(U.uVP, false, vp);
      gl.uniform3fv(U.uEye, eye);
      gl.uniform3fv(U.uSky, colors.sky || [0.66, 0.85, 0.85]);
      gl.uniform3fv(U.uFloor, colors.floor || [0.02, 0.1, 0.12]);
      gl.uniform3fv(U.uRim, colors.rim || [0, 0.72, 0.71]);
      gl.uniform1i(U.uTex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.enable(gl.DEPTH_TEST);

      let blending = false;

      for (const draw of draws) {
        const material = draw.material;

        if (material.alphaMode === 2 && !blending) {
          blending = true;
          gl.enable(gl.BLEND);
          gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE_MINUS_SRC_ALPHA,
          );
          gl.depthMask(false);
        }

        gl.uniformMatrix4fv(U.uModel, false, draw.model);
        gl.uniform4fv(U.uBase, material.base);

        const texture =
          material.tex != null ? textureFor(material.tex) : null;

        gl.uniform1f(U.uHasTex, texture ? 1 : 0);
        if (texture) gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.uniform1f(U.uMetal, material.metal);
        gl.uniform1f(U.uRough, material.rough);
        gl.uniform3fv(U.uEmissive, material.emissive);
        gl.uniform1f(U.uCoat, material.coat);
        gl.uniform1f(U.uAlphaMode, material.alphaMode);
        gl.uniform1f(U.uCutoff, material.cutoff);

        bindAttr(
          loc.aPos,
          draw.prim.attributes.POSITION,
          [0, 0, 0, 1],
        );
        bindAttr(
          loc.aNor,
          draw.prim.attributes.NORMAL,
          [0, 1, 0, 0],
        );
        bindAttr(
          loc.aUV,
          draw.prim.attributes.TEXCOORD_0,
          [0, 0, 0, 0],
        );

        if (draw.idx) {
          gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            bufferFor(draw.idx.bufferView, gl.ELEMENT_ARRAY_BUFFER),
          );
          gl.drawElements(
            gl.TRIANGLES,
            draw.idx.count,
            draw.idx.componentType,
            draw.idx.byteOffset || 0,
          );
        } else {
          gl.drawArrays(
            gl.TRIANGLES,
            0,
            json.accessors[draw.prim.attributes.POSITION].count,
          );
        }
      }

      if (blending) {
        gl.disable(gl.BLEND);
        gl.depthMask(true);
      }

      for (const location of Object.values(loc)) {
        if (location >= 0) gl.disableVertexAttribArray(location);
      }
    },

    destroy() {
      for (const buffer of glBuffers.values()) gl.deleteBuffer(buffer);
      for (const texture of glTextures.values()) {
        if (texture) gl.deleteTexture(texture);
      }
      gl.deleteProgram(prog);
    },
  };
}
