import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { ORIGIN, PASSWORD, startTestServer } from './helpers.js'

let t
const tokens = {}

before(async () => {
  t = await startTestServer()
  for (const role of ['admin', 'editor', 'viewer']) {
    tokens[role] = await t.login(role)
  }
})

after(() => t?.stop())

const validProduct = (over = {}) => ({
  name: 'Test Cabin Filter',
  category: 'Cabin Filter',
  partNumber: 'TEST-001',
  description: 'Made up for the tests.',
  listed: true,
  stock: { status: 'unconfirmed' },
  pricePhp: null,
  links: { shopee: 'https://shopee.ph/example-test-listing' },
  ...over,
})

describe('health and basics', () => {
  test('health checks work without sign-in', async () => {
    assert.equal((await t.call('/healthz')).status, 200)
    assert.deepEqual((await t.call('/readyz')).body, { ok: true })
  })

  test('unknown routes return 404 JSON', async () => {
    const res = await t.call('/api/nothing-here', {
      token: tokens.viewer,
    })
    assert.equal(res.status, 404)
    assert.ok(res.body.error)
  })

  test('security headers are set', async () => {
    const res = await t.call('/healthz')
    assert.equal(
      res.headers.get('x-content-type-options'),
      'nosniff'
    )
  })

  test('CORS allows only the listed origin', async () => {
    const ok = await t.call('/healthz', {
      headers: { Origin: ORIGIN },
    })
    assert.equal(
      ok.headers.get('access-control-allow-origin'),
      ORIGIN
    )

    const bad = await t.call('/healthz', {
      headers: { Origin: 'https://evil.example' },
    })
    assert.equal(
      bad.headers.get('access-control-allow-origin'),
      null
    )
  })
})

describe('sign-in gate', () => {
  for (const path of [
    '/api/brands',
    '/api/models',
    '/api/products',
    '/api/compatibility',
    '/api/users',
    '/api/auth/me',
  ]) {
    test(`${path} requires sign-in`, async () => {
      const res = await t.call(path)
      assert.equal(res.status, 401)
      assert.ok(res.body.error)
    })
  }

  test('a made-up token returns 401', async () => {
    const res = await t.call('/api/brands', {
      token: 'x'.repeat(43),
    })
    assert.equal(res.status, 401)
  })

  test('wrong password and unknown email use the same message', async () => {
    const wrong = await t.call('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'viewer@example.test',
        password: 'not-the-password',
      },
    })
    const unknown = await t.call('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'nobody@example.test',
        password: 'not-the-password',
      },
    })

    assert.equal(wrong.status, 401)
    assert.equal(unknown.status, 401)
    assert.equal(wrong.body.error, unknown.body.error)
  })

  test('missing fields and broken JSON return 400', async () => {
    assert.equal(
      (await t.call('/api/auth/login', {
        method: 'POST',
        body: {},
      })).status,
      400
    )

    assert.equal(
      (await t.call('/api/auth/login', {
        method: 'POST',
        body: '{"email":',
      })).status,
      400
    )
  })

  test('login does not expose the password hash', async () => {
    const res = await t.call('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'viewer@example.test',
        password: PASSWORD,
      },
    })

    assert.equal(res.status, 200)
    assert.equal(res.body.user.role, 'viewer')
    assert.ok(!JSON.stringify(res.body).includes('scrypt'))
  })

  test('me returns the signed-in account', async () => {
    const res = await t.call('/api/auth/me', {
      token: tokens.editor,
    })
    assert.equal(res.status, 200)
    assert.equal(res.body.user.email, 'editor@example.test')
  })

  test('logout ends the session', async () => {
    const token = await t.login('viewer')
    assert.equal(
      (await t.call('/api/auth/logout', {
        method: 'POST',
        token,
      })).status,
      204
    )
    assert.equal(
      (await t.call('/api/brands', { token })).status,
      401
    )
  })

  test('five failed logins block the sixth attempt', async () => {
    const body = {
      email: 'limit@example.test',
      password: 'wrong-password',
    }

    for (let i = 0; i < 5; i += 1) {
      assert.equal(
        (await t.call('/api/auth/login', {
          method: 'POST',
          body,
        })).status,
        401
      )
    }

    assert.equal(
      (await t.call('/api/auth/login', {
        method: 'POST',
        body,
      })).status,
      429
    )
  })
})

describe('catalogue', () => {
  test('brands include model counts', async () => {
    const res = await t.call('/api/brands', {
      token: tokens.viewer,
    })
    assert.equal(res.status, 200)
    assert.deepEqual(
      res.body.brands.map((b) => [b.id, b.modelCount]),
      [['honda', 3], ['nissan', 3], ['suzuki', 3]]
    )
  })

  test('Terra includes its years and model credit', async () => {
    const res = await t.call('/api/brands/nissan/models', {
      token: tokens.viewer,
    })
    assert.equal(res.status, 200)

    const terra = res.body.models.find(
      (m) => m.id === 'nissan-terra'
    )
    assert.deepEqual(terra.years, { from: 2018, to: 2026 })
    assert.equal(terra.reference.model.license, 'CC BY 4.0')
    assert.equal(terra.confirmedProductCount, 3)
  })

  test('unknown brands and models return 404', async () => {
    for (const path of [
      '/api/brands/ford/models',
      '/api/models/no-such-car',
      '/api/models/BAD%20ID',
    ]) {
      assert.equal(
        (await t.call(path, { token: tokens.viewer })).status,
        404
      )
    }
  })

  test('pending results contain unverified records only', async () => {
    const { rows } = await t.db.query(
      `INSERT INTO compatibility
        (product_id, model_id, year_from, year_to, status, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        27,
        'nissan-navara-calibre-e',
        2021,
        2026,
        'needs_verification',
        'Temporary unverified record for this test',
      ]
    )

    try {
      const res = await t.call(
        '/api/models/nissan-navara-calibre-e/pending',
        { token: tokens.viewer }
      )

      assert.equal(res.status, 200)
      assert.equal(res.body.pending.length, 1)
      assert.equal(res.body.pending[0].record.id, rows[0].id)
      assert.ok(
        res.body.pending.every(
          (p) => p.record.status === 'needs_verification'
        )
      )
    } finally {
      await t.db.query(
        'DELETE FROM compatibility WHERE id = $1',
        [rows[0].id]
    )
  })
})

describe('products', () => {
  test('signed-in users can read products and fit records', async () => {
    const list = await t.call('/api/products', {
      token: tokens.viewer,
    })
    assert.equal(list.status, 200)
    assert.equal(list.body.products.length, 27)

    const one = await t.call('/api/products/3', {
      token: tokens.viewer,
    })
    assert.equal(one.status, 200)
    assert.match(
      one.body.product.links.shopee,
      /^https:\/\/shopee\./
    )
    assert.equal(one.body.product.compatibility.length, 2)
    assert.equal(one.body.product.pricePhp, null)
  })

  test('invalid IDs return 400 and missing products return 404', async () => {
    assert.equal(
      (await t.call('/api/products/abc', {
        token: tokens.viewer,
      })).status,
      400
    )
    assert.equal(
      (await t.call('/api/products/999999', {
        token: tokens.viewer,
      })).status,
      404
    )
  })

  test('viewers cannot create products', async () => {
    assert.equal(
      (await t.call('/api/products', {
        method: 'POST',
        token: tokens.viewer,
        body: validProduct(),
      })).status,
      403
    )
  })

  test('invalid product values return 400', async () => {
    const cases = [
      validProduct({ name: '' }),
      validProduct({ category: 'Spoiler' }),
      validProduct({ pricePhp: -5 }),
      validProduct({ pricePhp: 10.555 }),
      validProduct({ stock: { status: 'in_stock' } }),
      validProduct({
        stock: {
          status: 'in_stock',
          checkedOn: '2999-01-01',
        },
      }),
      validProduct({ links: { shopee: 'http://shopee.ph/x' } }),
      validProduct({ links: { lazada: 'https://evil.example/x' } }),
      validProduct({ listed: 'yes' }),
    ]

    for (const body of cases) {
      const res = await t.call('/api/products', {
        method: 'POST',
        token: tokens.editor,
        body,
      })
      assert.equal(res.status, 400, JSON.stringify(body))
      assert.ok(res.body.error)
    }
  })

  test('editors can create, update and delete products', async () => {
    const created = await t.call('/api/products', {
      method: 'POST',
      token: tokens.editor,
      body: validProduct({
        pricePhp: 450.5,
        stock: {
          status: 'in_stock',
          checkedOn: '2026-09-30',
        },
      }),
    })

    assert.equal(created.status, 201)
    const { id } = created.body.product
    assert.equal(
      created.headers.get('location'),
      `/api/products/${id}`
    )
    assert.equal(created.body.product.pricePhp, 450.5)
    assert.deepEqual(created.body.product.stock, {
      status: 'in_stock',
      checkedOn: '2026-09-30',
    })
    assert.equal(created.body.product.links.lazada, null)

    const updated = await t.call(`/api/products/${id}`, {
      method: 'PUT',
      token: tokens.editor,
      body: validProduct({
        name: 'Renamed Filter',
        links: {
          lazada: 'https://www.lazada.com.ph/products/test.html',
        },
      }),
    })

    assert.equal(updated.status, 200)
    assert.equal(updated.body.product.name, 'Renamed Filter')
    assert.equal(updated.body.product.links.shopee, null)
    assert.match(updated.body.product.links.lazada, /lazada/)

    assert.equal(
      (await t.call(`/api/products/${id}`, {
        method: 'DELETE',
        token: tokens.editor,
      })).status,
      204
    )
    assert.equal(
      (await t.call(`/api/products/${id}`, {
        token: tokens.editor,
      })).status,
      404
    )
    assert.equal(
      (await t.call(`/api/products/${id}`, {
        method: 'DELETE',
        token: tokens.editor,
      })).status,
      404
    )
  })

  test('updating a missing product returns 404', async () => {
    assert.equal(
      (await t.call('/api/products/999999', {
        method: 'PUT',
        token: tokens.editor,
        body: validProduct(),
      })).status,
      404
    )
  })

  test('SQL-looking input is stored as text', async () => {
    const name = "Filter'); DROP TABLE products;--"
    const res = await t.call('/api/products', {
      method: 'POST',
      token: tokens.admin,
      body: validProduct({ name }),
    })

    assert.equal(res.status, 201)
    assert.equal(res.body.product.name, name)
    assert.equal(
      (await t.call('/api/products', {
        token: tokens.viewer,
      })).status,
      200
    )

    await t.call(`/api/products/${res.body.product.id}`, {
      method: 'DELETE',
      token: tokens.admin,
    })
  })
})

describe('compatibility records', () => {
  const record = (over = {}) => ({
    productId: 1,
    modelId: 'honda-city',
    yearFrom: 2020,
    yearTo: 2022,
    status: 'confirmed',
    source: 'Test listing title',
    ...over,
  })

  test('records can be filtered by model', async () => {
    const res = await t.call(
      '/api/compatibility?modelId=nissan-terra',
      { token: tokens.viewer }
    )
    assert.equal(res.status, 200)
    assert.equal(res.body.records.length, 3)
    assert.ok(
      res.body.records.every(
        (r) => r.modelId === 'nissan-terra'
      )
    )
  })

  test('invalid compatibility values return 400', async () => {
    for (const body of [
      record({ yearTo: 2010 }),
      record({ yearFrom: null, yearTo: null }),
      record({ source: '' }),
      record({ status: 'maybe' }),
      record({ yearFrom: 1850 }),
      record({ productId: 'x' }),
    ]) {
      assert.equal(
        (await t.call('/api/compatibility', {
          method: 'POST',
          token: tokens.editor,
          body,
        })).status,
        400,
        JSON.stringify(body)
      )
    }
  })

  test('unknown products and models return 400', async () => {
    for (const body of [
      record({ productId: 999999 }),
      record({ modelId: 'no-such-car' }),
    ]) {
      assert.equal(
        (await t.call('/api/compatibility', {
          method: 'POST',
          token: tokens.editor,
          body,
        })).status,
        400
      )
    }
  })

  test('viewers cannot edit; editors can manage records', async () => {
    assert.equal(
      (await t.call('/api/compatibility', {
        method: 'POST',
        token: tokens.viewer,
        body: record(),
      })).status,
      403
    )

    const created = await t.call('/api/compatibility', {
      method: 'POST',
      token: tokens.editor,
      body: record(),
    })
    assert.equal(created.status, 201)
    assert.equal(created.body.record.vehicle, 'Honda City')

    const id = created.body.record.id
    const updated = await t.call(`/api/compatibility/${id}`, {
      method: 'PUT',
      token: tokens.editor,
      body: record({ yearTo: null }),
    })
    assert.equal(updated.status, 200)
    assert.equal(updated.body.record.yearTo, null)

    assert.equal(
      (await t.call(`/api/compatibility/${id}`, {
        method: 'DELETE',
        token: tokens.editor,
      })).status,
      204
    )
    assert.equal(
      (await t.call(`/api/compatibility/${id}`, {
        token: tokens.editor,
      })).status,
      404
    )
  })
})

describe('users', () => {
  test('editors and viewers cannot access user administration', async () => {
    for (const role of ['editor', 'viewer']) {
      assert.equal(
        (await t.call('/api/users', {
          token: tokens[role],
        })).status,
        403
      )
    }
  })

  test('admins list users without password hashes', async () => {
    const res = await t.call('/api/users', {
      token: tokens.admin,
    })
    assert.equal(res.status, 200)
    assert.ok(res.body.users.length >= 3)
    assert.ok(
      res.body.users.every(
        (u) =>
          !('password_hash' in u) &&
          !('passwordHash' in u)
      )
    )
  })

  test('account creation checks duplicate emails and passwords', async () => {
    const body = {
      name: 'New Person',
      email: 'New.Person@Example.test',
      role: 'viewer',
      password: 'long-enough-password',
    }

    const created = await t.call('/api/users', {
      method: 'POST',
      token: tokens.admin,
      body,
    })
    assert.equal(created.status, 201)
    assert.equal(
      created.body.user.email,
      'new.person@example.test'
    )

    assert.equal(
      (await t.call('/api/users', {
        method: 'POST',
        token: tokens.admin,
        body,
      })).status,
      409
    )

    assert.equal(
      (await t.call('/api/users', {
        method: 'POST',
        token: tokens.admin,
        body: {
          ...body,
          email: 'x@example.test',
          password: 'short',
        },
      })).status,
      400
    )
  })

  test('deactivation ends sessions and blocks sign-in', async () => {
    const created = await t.call('/api/users', {
      method: 'POST',
      token: tokens.admin,
      body: {
        name: 'Temp',
        email: 'temp@example.test',
        role: 'viewer',
        password: 'long-enough-password',
      },
    })
    const id = created.body.user.id

    const login = await t.call('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'temp@example.test',
        password: 'long-enough-password',
      },
    })
    const token = login.body.token

    assert.equal(
      (await t.call(`/api/users/${id}`, {
        method: 'PATCH',
        token: tokens.admin,
        body: { active: false },
      })).status,
      200
    )
    assert.equal(
      (await t.call('/api/brands', { token })).status,
      401
    )
    assert.equal(
      (await t.call('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'temp@example.test',
          password: 'long-enough-password',
        },
      })).status,
      403
    )
    assert.equal(
      (await t.call(`/api/users/${id}`, {
        method: 'DELETE',
        token: tokens.admin,
      })).status,
      204
    )
  })

  test('admins cannot remove their own access or account', async () => {
    const me = t.users.admin.id

    for (const body of [
      { role: 'viewer' },
      { active: false },
    ]) {
      assert.equal(
        (await t.call(`/api/users/${me}`, {
          method: 'PATCH',
          token: tokens.admin,
          body,
        })).status,
        409
      )
    }

    assert.equal(
      (await t.call(`/api/users/${me}`, {
        method: 'DELETE',
        token: tokens.admin,
      })).status,
      409
    )
  })

  test('empty updates return 400 and missing users return 404', async () => {
    assert.equal(
      (await t.call(`/api/users/${t.users.viewer.id}`, {
        method: 'PATCH',
        token: tokens.admin,
        body: {},
      })).status,
      400
    )

    assert.equal(
      (await t.call('/api/users/999999', {
        method: 'PATCH',
        token: tokens.admin,
        body: { name: 'X' },
      })).status,
      404
    )
  })
})

describe('finder prompts', () => {
  const ask = (text) =>
    t.call('/api/finder', {
      method: 'POST',
      token: tokens.viewer,
      body: { text },
    })

  test('empty text returns 400', async () => {
    assert.equal((await ask('')).status, 400)
  })

  test('asks for a missing vehicle', async () => {
    const res = await ask('cabin filter please')
    assert.equal(res.body.kind, 'ask-model')
    assert.equal(res.body.parsed.category, 'Cabin Filter')
  })

  test('asks for a missing or out-of-range year', async () => {
    assert.equal(
      (await ask('cabin filter for terra')).body.kind,
      'ask-year'
    )

    const out = await ask('terra 2005')
    assert.equal(out.body.kind, 'ask-year')
    assert.equal(out.body.parsed.year, 2005)
  })

  test('narrows model choices to the named brand', async () => {
    const res = await ask('suzuki aircon 2021')
    assert.equal(res.body.kind, 'ask-model')
    assert.ok(
      res.body.options.every((m) => m.brandId === 'suzuki')
    )
  })
})
