import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer } from './helpers.js'
import {
  findCompatibleProducts,
} from '../src/repos/compatibleProductsRepo.js'

let t
let token

before(async () => {
  t = await startTestServer()
  token = await t.login('viewer')
})

after(() => t?.stop())

const ids = (matches) =>
  matches.map((m) => m.product.id)

describe('confirmed compatibility query', () => {
  test('Terra 2020 returns three parts in category order', async () => {
    const matches = await findCompatibleProducts(
      t.db,
      'nissan-terra',
      2020
    )
    assert.deepEqual(ids(matches), [3, 1, 2])
  })

  test('matches include product links and the fit record', async () => {
    const [first] = await findCompatibleProducts(
      t.db,
      'nissan-terra',
      2020
    )

    assert.equal(first.product.name, 'Cabin Filter (Terra / Navara NP300)')
    assert.equal(first.product.category, 'Cabin Filter')
    assert.match(
      first.product.links.shopee,
      /^https:\/\/shopee\./
    )
    assert.equal(first.record.status, 'confirmed')
    assert.equal(first.record.yearFrom, 2018)
    assert.equal(first.record.yearTo, 2026)
    assert.ok(first.record.source.length > 0)
    assert.equal(typeof first.record.id, 'number')
  })

  test('both ends of a recorded year range are included', async () => {
    const model = 'nissan-navara-calibre-e'

    assert.ok(
      ids(await findCompatibleProducts(t.db, model, 2014))
        .includes(3)
    )
    assert.ok(
      ids(await findCompatibleProducts(t.db, model, 2020))
        .includes(3)
    )
    assert.ok(
      !ids(await findCompatibleProducts(t.db, model, 2021))
        .includes(3)
    )
  })

  test('a null ending year means onward', async () => {
    const { rows } = await t.db.query(
      `INSERT INTO compatibility
        (product_id, model_id, year_from, year_to, status, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        27,
        'nissan-terra',
        2020,
        null,
        'confirmed',
        'Temporary open-ended record for this test',
      ]
    )

    try {
      const matches = await findCompatibleProducts(
        t.db,
        'nissan-terra',
        2026
      )

      const match = matches.find((m) => m.product.id === 27)
      assert.ok(match)
      assert.equal(match.record.yearTo, null)
    } finally {
      await t.db.query(
        'DELETE FROM compatibility WHERE id = $1',
        [rows[0].id]
      )
    }
  })

  test('unverified records are excluded', async () => {
    const { rows } = await t.db.query(
      `INSERT INTO compatibility
        (product_id, model_id, year_from, year_to, status, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        27,
        'nissan-terra',
        2018,
        2026,
        'needs_verification',
        'Temporary unverified record for this test',
      ]
    )

    try {
      const matches = await findCompatibleProducts(
        t.db,
        'nissan-terra',
        2020
      )

      assert.deepEqual(ids(matches), [3, 1, 2])
      assert.ok(!ids(matches).includes(27))
    } finally {
      await t.db.query(
        'DELETE FROM compatibility WHERE id = $1',
        [rows[0].id]
      )
    }
  })

  test('unlisted products are excluded', async () => {
    await t.db.query(
      'UPDATE products SET listed = false WHERE id = 2'
    )

    try {
      const matches = await findCompatibleProducts(
        t.db,
        'nissan-terra',
        2020
      )
      assert.deepEqual(ids(matches), [3, 1])
    } finally {
      await t.db.query(
        'UPDATE products SET listed = true WHERE id = 2'
      )
    }
  })

  test('overlapping records do not duplicate a product', async () => {
    const { rows } = await t.db.query(
      `INSERT INTO compatibility
        (product_id, model_id, year_from, year_to, status, source)
       VALUES (2, 'nissan-terra', 2019, 2022, 'confirmed', 'test duplicate')
       RETURNING id`
    )

    try {
      const matches = await findCompatibleProducts(
        t.db,
        'nissan-terra',
        2020
      )
      assert.deepEqual(ids(matches), [3, 1, 2])
    } finally {
      await t.db.query(
        'DELETE FROM compatibility WHERE id = $1',
        [rows[0].id]
      )
    }
  })

  test('a year without confirmed fits returns an empty array', async () => {
    assert.deepEqual(
      await findCompatibleProducts(t.db, 'honda-city', 2024),
      []
    )
  })

  test('SQL-looking model IDs do not bypass filtering', async () => {
    assert.deepEqual(
      await findCompatibleProducts(
        t.db,
        "nissan-terra' OR '1'='1",
        2020
      ),
      []
    )
  })
})

describe('vehicle product-search route', () => {
  const get = (path) => t.call(path, { token })

  test('returns model, year and matches', async () => {
    const res = await get(
      '/api/models/nissan-terra/products?year=2020'
    )

    assert.equal(res.status, 200)
    assert.equal(res.body.model.id, 'nissan-terra')
    assert.equal(res.body.year, 2020)
    assert.deepEqual(ids(res.body.matches), [3, 1, 2])
  })

  test('no confirmed fits returns 200 with an empty list', async () => {
    const res = await get(
      '/api/models/honda-city/products?year=2024'
    )
    assert.equal(res.status, 200)
    assert.deepEqual(res.body.matches, [])
  })

  test('unknown models return 404', async () => {
    const res = await get(
      '/api/models/no-such-car/products?year=2020'
    )
    assert.equal(res.status, 404)
    assert.ok(res.body.error)
  })

  for (const [why, query] of [
    ['missing year', ''],
    ['not a number', '?year=abc'],
    ['not a whole number', '?year=2020.5'],
    ['before the model range', '?year=2005'],
    ['after the model range', '?year=2031'],
  ]) {
    test(`${why} returns 400`, async () => {
      const res = await get(
        `/api/models/nissan-terra/products${query}`
      )
      assert.equal(res.status, 400)
      assert.ok(res.body.error)
    })
  }

  test('sign-in is required', async () => {
    assert.equal(
      (await t.call(
        '/api/models/nissan-terra/products?year=2020'
      )).status,
      401
    )
  })

  test('Finder uses the same compatibility search', async () => {
    const res = await t.call('/api/finder', {
      method: 'POST',
      token,
      body: {
        text: 'cabin filter for nissan terra 2020',
      },
    })

    assert.equal(res.status, 200)
    assert.equal(res.body.kind, 'results')
    assert.deepEqual(ids(res.body.matches), [3])
    assert.equal(res.body.totalForVehicle, 3)
  })
})
