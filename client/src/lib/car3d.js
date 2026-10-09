/*
 * Interactive WebGL vehicle preview.
 * Generic cars are built from the profiles in bodies.js.
 * An exact GLB model replaces the generic car when available.
 */

import { BODIES } from './bodies.js';
import { loadGlb, createGlbScene } from './glb.js';

const mat4 = {
  perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ]);
  },

  lookAt(eye, center, up) {
    let zx = eye[0] - center[0];
    let zy = eye[1] - center[1];
    let zz = eye[2] - center[2];
    let len = Math.hypot(zx, zy, zz);

    zx /= len;
    zy /= len;
    zz /= len;

    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;
    len = Math.hypot(xx, xy, xz);

    xx /= len;
    xy /= len;
    xz /= len;

    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;

    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1,
    ]);
  },

  multiply(a, b) {
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
  },
};

function pathToPoints(d, steps = 10) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) || [];
  const points = [];
  let i = 0;
  let command = 'M';
  let cx = 0;
  let cy = 0;

  const number = () => parseFloat(tokens[i++]);

  while (i < tokens.length) {
    if (/[MLCZ]/.test(tokens[i])) command = tokens[i++];
    if (command === 'Z') break;

    if (command === 'M' || command === 'L') {
      cx = number();
      cy = number();
      points.push([cx, cy]);
    } else if (command === 'C') {
      const x1 = number();
      const y1 = number();
      const x2 = number();
      const y2 = number();
      const x = number();
      const y = number();

      for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        const u = 1 - t;

        points.push([
          u * u * u * cx +
            3 * u * u * t * x1 +
            3 * u * t * t * x2 +
            t * t * t * x,
          u * u * u * cy +
            3 * u * u * t * y1 +
            3 * u * t * t * y2 +
            t * t * t * y,
        ]);
      }

      cx = x;
      cy = y;
    }
  }

  const out = [];

  for (const point of points) {
    const previous = out[out.length - 1];
    if (
      !previous ||
      Math.hypot(
        point[0] - previous[0],
        point[1] - previous[1],
      ) > 0.5
    ) {
      out.push(point);
    }
  }

  const first = out[0];
  const last = out[out.length - 1];

  if (
    out.length > 2 &&
    Math.hypot(first[0] - last[0], first[1] - last[1]) < 0.5
  ) {
    out.pop();
  }

  return out;
}

function cutArches(points, wheels, radius = 27) {
  const out = [];

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    out.push(a);

    if (
      Math.abs(a[1] - 128) < 0.6 &&
      Math.abs(b[1] - 128) < 0.6 &&
      Math.abs(a[0] - b[0]) > 60
    ) {
      const direction = Math.sign(b[0] - a[0]);

      const selectedWheels = wheels
        .filter(
          (wheel) =>
            (wheel - a[0]) * direction > 0 &&
            (b[0] - wheel) * direction > 0,
        )
        .sort((p, q) => (p - q) * direction);

      for (const wheel of selectedWheels) {
        const segments = 14;

        for (let step = 0; step <= segments; step += 1) {
          const t = (step / segments) * Math.PI;
          const angle = direction > 0 ? Math.PI - t : t;

          out.push([
            wheel + radius * Math.cos(angle),
            128 - radius * Math.sin(angle),
          ]);
        }
      }
    }
  }

  return out;
}

const area = (points) => {
  let sum = 0;

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }

  return sum / 2;
};

function triangulate(points) {
  const indices = points.map((_, i) => i);
  const triangles = [];

  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) -
    (a[1] - o[1]) * (b[0] - o[0]);

  const inside = (point, a, b, c) =>
    cross(a, b, point) >= 0 &&
    cross(b, c, point) >= 0 &&
    cross(c, a, point) >= 0;

  let guard = 0;

  while (indices.length > 3 && guard < 10000) {
    guard += 1;
    let clipped = false;

    for (let i = 0; i < indices.length; i += 1) {
      const i0 = indices[(i + indices.length - 1) % indices.length];
      const i1 = indices[i];
      const i2 = indices[(i + 1) % indices.length];

      const a = points[i0];
      const b = points[i1];
      const c = points[i2];

      if (cross(a, b, c) <= 1e-9) continue;

      let valid = true;

      for (const j of indices) {
        if (j === i0 || j === i1 || j === i2) continue;

        if (inside(points[j], a, b, c)) {
          valid = false;
          break;
        }
      }

      if (!valid) continue;

      triangles.push([i0, i1, i2]);
      indices.splice(i, 1);
      clipped = true;
      break;
    }

    if (!clipped) indices.splice(0, 1);
  }

  if (indices.length === 3) {
    triangles.push([indices[0], indices[1], indices[2]]);
  }

  return triangles;
}

const MAT = {
  paint: 0,
  glass: 1,
  matte: 2,
  glow: 3,
  chrome: 4,
};

export function buildCarGeometry(bodyKey = 'sedan') {
  const body = BODIES[bodyKey] || BODIES.sedan;
  const scale = 1 / 100;
  const toX = (x) => (x - 200) * scale;
  const toY = (y) => (150 - y) * scale;
  const half = 0.78;
  const bevel = 0.06;

  let profile = cutArches(
    pathToPoints(body.body),
    body.wheels,
  ).map(([x, y]) => [toX(x), toY(y)]);

  if (area(profile) < 0) profile = profile.reverse();

  const n = profile.length;
  const ys = profile.map((point) => point[1]);
  const xs = profile.map((point) => point[0]);
  const yTop = Math.max(...ys);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  const belt =
    toY(
      body.line
        ? Number(body.line.split(/[ML ]+/).filter(Boolean)[1])
        : 98,
    ) + 0.06;

  const zScale = (x, y) => {
    const t = Math.min(
      Math.max((y - belt) / Math.max(yTop - belt, 0.01), 0),
      1,
    );

    const glasshouse = 1 - 0.24 * t * t;
    const e = Math.min(
      (x - xMin) / 0.5,
      (xMax - x) / 0.5,
      1,
    );

    const ends =
      0.86 + 0.14 * Math.sin((Math.max(e, 0) * Math.PI) / 2);

    return glasshouse * ends;
  };

  const edgeNormals = [];

  for (let i = 0; i < n; i += 1) {
    const a = profile[i];
    const b = profile[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy) || 1;

    edgeNormals.push([dy / length, -dx / length]);
  }

  const vertexNormals = profile.map((_, i) => {
    const e1 = edgeNormals[(i + n - 1) % n];
    const e2 = edgeNormals[i];
    const x = e1[0] + e2[0];
    const y = e1[1] + e2[1];
    const length = Math.hypot(x, y) || 1;
    return [x / length, y / length];
  });

  const inset = profile.map((point, i) => [
    point[0] - vertexNormals[i][0] * bevel,
    point[1] - vertexNormals[i][1] * bevel,
  ]);

  const out = [];

  const push = (position, normal, material, shade = 1) =>
    out.push(
      position[0],
      position[1],
      position[2],
      normal[0],
      normal[1],
      normal[2],
      material,
      shade,
    );

  const normalize = (v) => {
    const length = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / length, v[1] / length, v[2] / length];
  };

  const point3 = (point, z) => [
    point[0],
    point[1],
    z * zScale(point[0], point[1]),
  ];

  const wallMaterial = (i) => {
    const a = profile[i];
    const b = profile[(i + 1) % n];
    const middleY = (a[1] + b[1]) / 2;
    const normalY = edgeNormals[i][1];

    if (
      middleY > belt + 0.05 &&
      normalY < 0.86 &&
      normalY > 0.15
    ) {
      return MAT.glass;
    }

    return MAT.paint;
  };

  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    const material = wallMaterial(i);

    const sharp =
      edgeNormals[i][0] * edgeNormals[(i + n - 1) % n][0] +
        edgeNormals[i][1] * edgeNormals[(i + n - 1) % n][1] <
      0.55;

    const sharpJ =
      edgeNormals[i][0] * edgeNormals[j][0] +
        edgeNormals[i][1] * edgeNormals[j][1] <
      0.55;

    const normalI = sharp ? edgeNormals[i] : vertexNormals[i];
    const normalJ = sharpJ ? edgeNormals[i] : vertexNormals[j];

    const a0 = point3(profile[i], half - bevel);
    const a1 = point3(profile[i], -(half - bevel));
    const b0 = point3(profile[j], half - bevel);
    const b1 = point3(profile[j], -(half - bevel));
    const normalA = [normalI[0], normalI[1], 0];
    const normalB = [normalJ[0], normalJ[1], 0];

    push(a0, normalA, material);
    push(b0, normalB, material);
    push(b1, normalB, material);
    push(a0, normalA, material);
    push(b1, normalB, material);
    push(a1, normalA, material);
  }

  const triangles = triangulate(inset);

  for (const side of [1, -1]) {
    const capNormal = (point) => {
      const t = Math.min(
        Math.max((point[1] - belt) / Math.max(yTop - belt, 0.01), 0),
        1,
      );

      return normalize([0, 0.45 * t, side]);
    };

    for (let i = 0; i < n; i += 1) {
      const j = (i + 1) % n;
      const material =
        wallMaterial(i) === MAT.glass ? MAT.glass : MAT.paint;

      const w0 = point3(profile[i], side * (half - bevel));
      const w1 = point3(profile[j], side * (half - bevel));
      const c0 = point3(inset[i], side * half);
      const c1 = point3(inset[j], side * half);

      const n0 = normalize([
        vertexNormals[i][0],
        vertexNormals[i][1],
        side * 1.1,
      ]);
      const n1 = normalize([
        vertexNormals[j][0],
        vertexNormals[j][1],
        side * 1.1,
      ]);

      if (side > 0) {
        push(w0, n0, material);
        push(c0, n0, material);
        push(c1, n1, material);
        push(w0, n0, material);
        push(c1, n1, material);
        push(w1, n1, material);
      } else {
        push(w0, n0, material);
        push(c1, n1, material);
        push(c0, n0, material);
        push(w0, n0, material);
        push(w1, n1, material);
        push(c1, n1, material);
      }
    }

    for (const [a, b, c] of triangles) {
      const pa = point3(inset[a], side * half);
      const pb = point3(inset[b], side * half);
      const pc = point3(inset[c], side * half);

      if (side > 0) {
        push(pa, capNormal(inset[a]), MAT.paint);
        push(pb, capNormal(inset[b]), MAT.paint);
        push(pc, capNormal(inset[c]), MAT.paint);
      } else {
        push(pa, capNormal(inset[a]), MAT.paint);
        push(pc, capNormal(inset[c]), MAT.paint);
        push(pb, capNormal(inset[b]), MAT.paint);
      }
    }

    for (const glassPath of body.glass) {
      let glass = pathToPoints(glassPath).map(([x, y]) => [
        toX(x),
        toY(y),
      ]);

      if (area(glass) < 0) glass = glass.reverse();

      const glassTriangles = triangulate(glass);
      const z = side * (half + 0.004);

      for (const [a, b, c] of glassTriangles) {
        const order = side > 0 ? [a, b, c] : [a, c, b];

        for (const k of order) {
          push(point3(glass[k], z), capNormal(glass[k]), MAT.glass);
        }
      }
    }

    const strip = (x0, y0, x1, y1, height, shade) => {
      const z = side * (half + 0.006);
      const normal = [0, 0, side];
      const steps = 24;

      for (let k = 0; k < steps; k += 1) {
        const t0 = k / steps;
        const t1 = (k + 1) / steps;
        const xa = x0 + (x1 - x0) * t0;
        const xb = x0 + (x1 - x0) * t1;
        const ya = y0 + (y1 - y0) * t0;
        const yb = y0 + (y1 - y0) * t1;

        const a = point3([xa, ya - height], z);
        const b = point3([xb, yb - height], z);
        const c = point3([xb, yb + height], z);
        const d = point3([xa, ya + height], z);

        for (const vertex of [a, b, c, a, c, d]) {
          push(vertex, normal, MAT.glow, shade);
        }
      }
    };

    if (body.line) {
      const values = body.line.match(/-?\d*\.?\d+/g).map(Number);
      strip(
        toX(values[0]) + 0.08,
        toY(values[1]),
        toX(values[2]) - 0.08,
        toY(values[3]),
        0.008,
        0.7,
      );
    }

    if (body.lamp) {
      const values = body.lamp.match(/-?\d*\.?\d+/g).map(Number);
      strip(
        toX(values[0]) - 0.04,
        toY(values[1]),
        toX(values[2]) - 0.02,
        toY(values[3]),
        0.022,
        1,
      );
    }
  }

  const bar = (x, y0, y1, shade) => {
    for (const side of [-1, 1]) {
      const z0 = side * 0.12;
      const z1 = side * (half - 0.14);
      const normal = [x > 0 ? 1 : -1, 0, 0];
      const xo = x + (x > 0 ? 0.004 : -0.004);

      const a = [xo, y0, z0];
      const b = [xo, y0, z1];
      const c = [xo, y1, z1];
      const d = [xo, y1, z0];

      const faceOut = (x > 0) === (side > 0);
      const vertices = faceOut
        ? [a, b, c, a, c, d]
        : [a, c, b, a, d, c];

      for (const vertex of vertices) {
        push(vertex, normal, MAT.glow, shade);
      }
    }
  };

  const xAt = (y, front) => {
    let best = front ? -Infinity : Infinity;

    for (let i = 0; i < n; i += 1) {
      const p = profile[i];
      const q = profile[(i + 1) % n];

      if ((p[1] - y) * (q[1] - y) > 0 || p[1] === q[1]) {
        continue;
      }

      const x =
        p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]);

      best = front ? Math.max(best, x) : Math.min(best, x);
    }

    return Number.isFinite(best) ? best : front ? xMax : xMin;
  };

  const lampY = body.lamp
    ? toY(Number(body.lamp.match(/-?\d*\.?\d+/g)[1]))
    : 0.55;

  bar(
    Math.max(xAt(lampY - 0.02, true), xAt(lampY + 0.015, true)),
    lampY - 0.02,
    lampY + 0.015,
    1,
  );

  bar(
    Math.min(xAt(lampY - 0.06, false), xAt(lampY - 0.03, false)),
    lampY - 0.06,
    lampY - 0.03,
    0.55,
  );

  const radius = 0.225;
  const wheelDepth = 0.24;
  const segments = 36;

  for (const wheelX of body.wheels) {
    const cx = toX(wheelX);
    const cy = toY(128);

    for (const side of [1, -1]) {
      const zc = side * (half - 0.1);
      const zo = zc + side * wheelDepth * 0.5;
      const zi = zc - side * wheelDepth * 0.5;

      for (let k = 0; k < segments; k += 1) {
        const a0 = (k / segments) * Math.PI * 2;
        const a1 = ((k + 1) / segments) * Math.PI * 2;
        const c0 = Math.cos(a0);
        const s0 = Math.sin(a0);
        const c1 = Math.cos(a1);
        const s1 = Math.sin(a1);

        const tread = [
          [cx + radius * c0, cy + radius * s0, zo],
          [cx + radius * c1, cy + radius * s1, zo],
          [cx + radius * c1, cy + radius * s1, zi],
          [cx + radius * c0, cy + radius * s0, zi],
        ];

        const n0 = [c0, s0, 0];
        const n1 = [c1, s1, 0];
        const order =
          side > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
        const normals = [n0, n1, n1, n0];

        for (const q of order) {
          push(tread[q], normals[q], MAT.matte, 0.55);
        }

        const ring = (r0, r1, material, shade, zf) => {
          const points = [
            [cx + r0 * c0, cy + r0 * s0, zf],
            [cx + r1 * c0, cy + r1 * s0, zf],
            [cx + r1 * c1, cy + r1 * s1, zf],
            [cx + r0 * c1, cy + r0 * s1, zf],
          ];

          const normal = [0, 0, side];
          const ringOrder =
            side > 0
              ? [0, 1, 2, 0, 2, 3]
              : [0, 2, 1, 0, 3, 2];

          for (const q of ringOrder) {
            push(points[q], normal, material, shade);
          }
        };

        ring(radius * 0.7, radius, MAT.matte, 0.5, zo);

        const spoke = k % 6 < 2;

        ring(
          radius * 0.18,
          radius * 0.7,
          spoke ? MAT.chrome : MAT.matte,
          spoke ? 1 : 0.35,
          zo - side * 0.01,
        );

        ring(
          0,
          radius * 0.18,
          MAT.glow,
          0.9,
          zo - side * 0.005,
        );

        ring(
          radius * 0.66,
          radius * 0.71,
          MAT.glow,
          0.6,
          zo + side * 0.001,
        );
      }
    }
  }

  return {
    data: new Float32Array(out),
    count: out.length / 8,
  };
}

const VS = `
attribute vec3 aPos; attribute vec3 aNor; attribute float aMat; attribute float aShade;
uniform mat4 uVP;
varying vec3 vPos; varying vec3 vNor; varying float vMat; varying float vShade;
void main(){ vPos=aPos; vNor=aNor; vMat=aMat; vShade=aShade; gl_Position=uVP*vec4(aPos,1.0); }`;

const FS = `
precision mediump float;
varying vec3 vPos; varying vec3 vNor; varying float vMat; varying float vShade;
uniform vec3 uEye; uniform vec3 uPaint; uniform vec3 uGlass; uniform vec3 uRim; uniform vec3 uGlow;
uniform vec3 uSky; uniform vec3 uFloor; uniform vec3 uMatte;
void main(){
  vec3 N=normalize(vNor); vec3 V=normalize(uEye-vPos);
  if(dot(N,V)<0.0) N=-N;
  vec3 L=normalize(vec3(0.35,0.9,0.45)); vec3 L2=normalize(vec3(-0.6,0.3,-0.7));
  float dif=max(dot(N,L),0.0); float dif2=max(dot(N,L2),0.0);
  float spec=pow(max(dot(N,normalize(L+V)),0.0),48.0);
  float fres=pow(1.0-max(dot(N,V),0.0),3.0);
  vec3 R=reflect(-V,N);
  vec3 env=mix(uFloor,uSky,smoothstep(-0.25,0.35,R.y));
  env+=vec3(1.0)*exp(-pow((R.y-0.18)*9.0,2.0))*0.45;
  vec3 col;
  if(vMat<0.5){
    col=uPaint*(0.16+0.58*dif)+uRim*dif2*0.28+env*0.24+vec3(spec)*0.65+uRim*fres*0.85;
  } else if(vMat<1.5){
    col=mix(uGlass,env,0.45)+vec3(spec)*0.9+uRim*fres*0.35;
  } else if(vMat<2.5){
    col=uMatte*vShade*(0.35+0.6*dif)+vec3(spec)*0.06;
  } else if(vMat<3.5){
    col=uGlow*(0.75+0.55*vShade);
  } else {
    col=mix(vec3(0.62,0.7,0.72),env,0.6)+vec3(spec)*0.9;
  }
  gl_FragColor=vec4(col,1.0);
}`;

const GVS = `
attribute vec2 aXZ; uniform mat4 uVP; varying vec2 vXZ;
void main(){ vXZ=aXZ; gl_Position=uVP*vec4(aXZ.x,0.0,aXZ.y,1.0); }`;

const GFS = `
precision mediump float;
varying vec2 vXZ; uniform vec3 uGlow; uniform vec3 uShadow; uniform float uRing; uniform float uGlowAmt;
void main(){
  float d=length(vXZ/vec2(3.1,1.9));
  float glow=smoothstep(1.0,0.0,d)*uGlowAmt;
  float sh=smoothstep(1.0,0.25,length(vXZ/vec2(2.15,0.98)))*0.85;
  float r=length(vXZ);
  float ring=exp(-pow((r-2.3)*16.0,2.0))*uRing;
  vec3 col=uGlow*(glow+ring);
  float a=clamp(glow+ring,0.0,1.0);
  col=mix(col,uShadow,sh); a=max(a,sh);
  gl_FragColor=vec4(col,a);
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

function program(gl, vertexSource, fragmentSource) {
  const prog = gl.createProgram();
  gl.attachShader(
    prog,
    compile(gl, gl.VERTEX_SHADER, vertexSource),
  );
  gl.attachShader(
    prog,
    compile(gl, gl.FRAGMENT_SHADER, fragmentSource),
  );
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || 'link');
  }

  return prog;
}

export const hexToRgb = (hex, fallback = [1, 1, 1]) => {
  const match = String(hex || '')
    .trim()
    .match(/^#?([0-9a-f]{6})$/i);

  if (!match) return fallback;

  const value = parseInt(match[1], 16);

  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
};

export function createCarRenderer(canvas, opts = {}) {
  const { autoRotate = true, interactive = true, onFail } = opts;
  let gl = null;

  try {
    gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
  } catch {
    gl = null;
  }

  if (!gl) {
    onFail?.('WebGL is not available');
    return null;
  }

  let prog;
  let groundProgram;

  try {
    prog = program(gl, VS, FS);
    groundProgram = program(gl, GVS, GFS);
  } catch (error) {
    onFail?.(String(error));
    return null;
  }

  const buffer = gl.createBuffer();
  let count = 0;

  const setBody = (body) => {
    const geometry = buildCarGeometry(body);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.data, gl.STATIC_DRAW);
    count = geometry.count;
  };

  setBody(opts.body);

  const groundBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);
  const groundSize = 4.2;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -groundSize, -groundSize,
      groundSize, -groundSize,
      groundSize, groundSize,
      -groundSize, -groundSize,
      groundSize, groundSize,
      -groundSize, groundSize,
    ]),
    gl.STATIC_DRAW,
  );

  let glbScene = null;
  let modelToken = 0;

  const setModel = (url, { onProgress, onStatus } = {}) => {
    modelToken += 1;
    const token = modelToken;

    glbScene?.destroy();
    glbScene = null;

    if (!url) return;

    onStatus?.('loading');

    loadGlb(
      url,
      (progress) =>
        token === modelToken && onProgress?.(progress),
    )
      .then((parsed) => {
        if (token !== modelToken) return;
        glbScene = createGlbScene(gl, parsed);
        onStatus?.('ready', parsed.credit);
      })
      .catch((error) => {
        if (token === modelToken) {
          onStatus?.(
            'error',
            error?.message || 'The model couldn’t be loaded.',
          );
        }
      });
  };

  let colors = opts.colors || {};

  const setColors = (nextColors) => {
    colors = nextColors || {};
  };

  let yaw = opts.initialYaw ?? 0.75;
  let pitch = 0.17;
  let target = yaw;
  let lastTime = performance.now();
  let raf = 0;
  let visible = true;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let idleUntil = 0;

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const draw = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr)
    ) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = Math.max(width / Math.max(height, 1), 0.1);

    const distance =
      (opts.distance ?? 7.4) *
      (aspect < 1.2 ? 1.25 : 1) *
      (width < 520 ? 0.88 : 1) *
      (colors.zoom ?? 1);

    const centerY = glbScene ? glbScene.height * 0.5 : 0.48;
    const eye = [
      Math.sin(yaw) * Math.cos(pitch) * distance,
      (glbScene ? centerY : 0.4) + Math.sin(pitch) * distance,
      Math.cos(yaw) * Math.cos(pitch) * distance,
    ];

    const vp = mat4.multiply(
      mat4.perspective(0.5, aspect, 0.1, 50),
      mat4.lookAt(
        eye,
        [
          0,
          centerY,
          0,
        ],
        [0, 1, 0],
      ),
    );

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(groundProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, groundBuffer);

    const aXZ = gl.getAttribLocation(groundProgram, 'aXZ');
    gl.enableVertexAttribArray(aXZ);
    gl.vertexAttribPointer(aXZ, 2, gl.FLOAT, false, 8, 0);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(groundProgram, 'uVP'),
      false,
      vp,
    );
    gl.uniform3fv(
      gl.getUniformLocation(groundProgram, 'uGlow'),
      colors.glow || [0, 0.72, 0.71],
    );
    gl.uniform3fv(
      gl.getUniformLocation(groundProgram, 'uShadow'),
      colors.shadow || [0, 0.05, 0.06],
    );
    gl.uniform1f(
      gl.getUniformLocation(groundProgram, 'uRing'),
      colors.ring ?? 0.6,
    );
    gl.uniform1f(
      gl.getUniformLocation(groundProgram, 'uGlowAmt'),
      colors.glowAmt ?? 0.55,
    );

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(aXZ);

    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

    if (glbScene) {
      glbScene.draw(vp, eye, colors);
      return;
    }

    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const location = (name) => gl.getAttribLocation(prog, name);

    const attributes = [
      [location('aPos'), 3, 0],
      [location('aNor'), 3, 12],
      [location('aMat'), 1, 24],
      [location('aShade'), 1, 28],
    ];

    for (const [attribute, size, offset] of attributes) {
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(
        attribute,
        size,
        gl.FLOAT,
        false,
        32,
        offset,
      );
    }

    const uniform = (name) => gl.getUniformLocation(prog, name);

    gl.uniformMatrix4fv(uniform('uVP'), false, vp);
    gl.uniform3fv(uniform('uEye'), eye);
    gl.uniform3fv(
      uniform('uPaint'),
      colors.paint || [0.88, 0.92, 0.92],
    );
    gl.uniform3fv(
      uniform('uGlass'),
      colors.glass || [0.0, 0.2, 0.23],
    );
    gl.uniform3fv(
      uniform('uRim'),
      colors.rim || [0, 0.72, 0.71],
    );
    gl.uniform3fv(
      uniform('uGlow'),
      colors.glow || [0, 0.72, 0.71],
    );
    gl.uniform3fv(
      uniform('uSky'),
      colors.sky || [0.75, 0.9, 0.9],
    );
    gl.uniform3fv(
      uniform('uFloor'),
      colors.floor || [0.02, 0.12, 0.14],
    );
    gl.uniform3fv(
      uniform('uMatte'),
      colors.matte || [0.08, 0.1, 0.11],
    );

    gl.drawArrays(gl.TRIANGLES, 0, count);

    for (const [attribute] of attributes) {
      gl.disableVertexAttribArray(attribute);
    }
  };

  const tick = (time) => {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (
      autoRotate &&
      !reduceMotion &&
      !dragging &&
      time > idleUntil
    ) {
      target += dt * 0.32;
    }

    yaw += (target - yaw) * Math.min(dt * 10, 1);

    if (!document.documentElement.classList.contains('is-intro')) {
      draw();
    }

    raf = visible ? requestAnimationFrame(tick) : 0;
  };

  const start = () => {
    if (!raf && visible) {
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  let observer = null;

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      visible =
        entries.some((entry) => entry.isIntersecting) &&
        !document.hidden;

      if (visible) start();
    });

    observer.observe(canvas);
  }

  const onVisibility = () => {
    visible = !document.hidden;
    if (visible) start();
  };

  document.addEventListener('visibilitychange', onVisibility);

  const down = (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };

  const move = (event) => {
    if (!dragging) return;

    target += (event.clientX - lastX) * 0.012;
    pitch = Math.min(
      Math.max(pitch + (event.clientY - lastY) * 0.004, 0.05),
      0.6,
    );

    lastX = event.clientX;
    lastY = event.clientY;
    idleUntil = performance.now() + 2500;
  };

  const up = () => {
    dragging = false;
    idleUntil = performance.now() + 2500;
  };

  const key = (event) => {
    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      event.preventDefault();
      target += event.key === 'ArrowLeft' ? -0.35 : 0.35;
      idleUntil = performance.now() + 3000;
    } else if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown'
    ) {
      event.preventDefault();

      pitch = Math.min(
        Math.max(
          pitch + (event.key === 'ArrowUp' ? 0.08 : -0.08),
          0.05,
        ),
        0.6,
      );

      idleUntil = performance.now() + 3000;
    }
  };

  if (interactive) {
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    canvas.addEventListener('keydown', key);
  }

  const lost = (event) => {
    event.preventDefault();
    onFail?.('The 3D view was interrupted');
  };

  canvas.addEventListener('webglcontextlost', lost);

  start();

  if (opts.modelUrl) setModel(opts.modelUrl, opts.modelEvents);

  return {
    setBody,
    setModel,
    setColors,

    rotateBy(rotation) {
      target += rotation;
      idleUntil = performance.now() + 3000;
    },

    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      observer?.disconnect();

      document.removeEventListener(
        'visibilitychange',
        onVisibility,
      );
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      canvas.removeEventListener('keydown', key);
      canvas.removeEventListener('webglcontextlost', lost);

      modelToken += 1;
      glbScene?.destroy();
      glbScene = null;
    },
  };
}
