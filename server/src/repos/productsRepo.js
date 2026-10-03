export const PRODUCT_COLUMNS = `
  p.id, p.name, p.category, p.part_number, p.description, p.listed,
  p.stock_status,
  to_char(p.stock_checked_on, 'YYYY-MM-DD') AS stock_checked_on,
  p.price_php::float8 AS price_php`

export function mapProduct(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    partNumber: row.part_number,
    description: row.description,
    listed: row.listed,
    stock: {
      status: row.stock_status,
      checkedOn: row.stock_checked_on,
    },
    pricePhp: row.price_php,
    links: { lazada: null, shopee: null, tiktok: null },
  }
}

export async function attachLinks(db, products) {
  if (products.length === 0) return products

  const { rows } = await db.query(
    `SELECT product_id, marketplace, url
       FROM product_links
      WHERE product_id = ANY($1::bigint[])`,
    [products.map((p) => p.id)]
  )

  const byId = new Map(products.map((p) => [p.id, p]))

  for (const row of rows) {
    byId.get(Number(row.product_id)).links[row.marketplace] = row.url
  }

  return products
}

export async function listProducts(db) {
  const { rows } = await db.query(
    `SELECT ${PRODUCT_COLUMNS},
            (SELECT count(*)::int
               FROM compatibility c
              WHERE c.product_id = p.id) AS fit_records
       FROM products p
      ORDER BY p.name, p.id`
  )

  const products = rows.map((r) => ({
    ...mapProduct(r),
    fitRecords: r.fit_records,
  }))

  return attachLinks(db, products)
}

export async function getProduct(db, id) {
  const { rows } = await db.query(
    `SELECT ${PRODUCT_COLUMNS} FROM products p WHERE p.id = $1`,
    [id]
  )

  if (rows.length === 0) return null

  const [product] = await attachLinks(db, [mapProduct(rows[0])])

  const compat = await db.query(
    `SELECT c.id, c.model_id, c.year_from, c.year_to, c.status, c.source,
            b.name AS brand_name, m.name AS model_name, m.variant
       FROM compatibility c
       JOIN vehicle_models m ON m.id = c.model_id
       JOIN brands b ON b.id = m.brand_id
      WHERE c.product_id = $1
      ORDER BY b.name, m.name, c.year_from NULLS LAST`,
    [id]
  )

  product.compatibility = compat.rows.map((r) => ({
    id: Number(r.id),
    modelId: r.model_id,
    vehicle: [r.brand_name, r.model_name, r.variant]
      .filter(Boolean)
      .join(' '),
    yearFrom: r.year_from,
    yearTo: r.year_to,
    status: r.status,
    source: r.source,
  }))

  return product
}

async function writeLinks(client, productId, links) {
  await client.query(
    'DELETE FROM product_links WHERE product_id = $1',
    [productId]
  )

  for (const [marketplace, url] of Object.entries(links)) {
    if (!url) continue

    await client.query(
      `INSERT INTO product_links (product_id, marketplace, url)
       VALUES ($1, $2, $3)`,
      [productId, marketplace, url]
    )
  }
}

async function inTransaction(db, fn) {
  const client = await db.connect()

  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function createProduct(db, input) {
  const id = await inTransaction(db, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO products
        (name, category, part_number, description, listed,
         stock_status, stock_checked_on, price_php)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        input.name,
        input.category,
        input.partNumber,
        input.description,
        input.listed,
        input.stockStatus,
        input.stockCheckedOn,
        input.pricePhp,
      ]
    )

    const newId = Number(rows[0].id)
    await writeLinks(client, newId, input.links)
    return newId
  })

  return getProduct(db, id)
}

export async function updateProduct(db, id, input) {
  const found = await inTransaction(db, async (client) => {
    const { rowCount } = await client.query(
      `UPDATE products
          SET name = $2, category = $3, part_number = $4,
              description = $5, listed = $6, stock_status = $7,
              stock_checked_on = $8, price_php = $9, updated_at = now()
        WHERE id = $1`,
      [
        id,
        input.name,
        input.category,
        input.partNumber,
        input.description,
        input.listed,
        input.stockStatus,
        input.stockCheckedOn,
        input.pricePhp,
      ]
    )

    if (rowCount === 0) return false

    await writeLinks(client, id, input.links)
    return true
  })

  return found ? getProduct(db, id) : null
}

export async function deleteProduct(db, id) {
  const { rowCount } = await db.query(
    'DELETE FROM products WHERE id = $1',
    [id]
  )
  return rowCount > 0
}
