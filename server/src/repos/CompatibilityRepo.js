const COLUMNS = `
  c.id, c.product_id, p.name AS product_name, p.category, c.model_id,
  b.name AS brand_name, m.name AS model_name, m.variant,
  c.year_from, c.year_to, c.status, c.source`

const FROM = `
  FROM compatibility c
  JOIN products p ON p.id = c.product_id
  JOIN vehicle_models m ON m.id = c.model_id
  JOIN brands b ON b.id = m.brand_id`

function mapRecord(r) {
  return {
    id: Number(r.id),
    productId: Number(r.product_id),
    productName: r.product_name,
    category: r.category,
    modelId: r.model_id,
    vehicle: [r.brand_name, r.model_name, r.variant]
      .filter(Boolean)
      .join(' '),
    yearFrom: r.year_from,
    yearTo: r.year_to,
    status: r.status,
    source: r.source,
  }
}

export async function listRecords(db, { modelId } = {}) {
  const { rows } = await db.query(
    `SELECT ${COLUMNS} ${FROM}
      WHERE ($1::text IS NULL OR c.model_id = $1)
      ORDER BY b.name, m.name, p.name, c.year_from NULLS LAST`,
    [modelId ?? null]
  )
  return rows.map(mapRecord)
}

export async function getRecord(db, id) {
  const { rows } = await db.query(
    `SELECT ${COLUMNS} ${FROM} WHERE c.id = $1`,
    [id]
  )
  return rows[0] ? mapRecord(rows[0]) : null
}

export async function createRecord(db, input) {
  const { rows } = await db.query(
    `INSERT INTO compatibility
      (product_id, model_id, year_from, year_to, status, source)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      input.productId,
      input.modelId,
      input.yearFrom,
      input.yearTo,
      input.status,
      input.source,
    ]
  )
  return getRecord(db, Number(rows[0].id))
}

export async function updateRecord(db, id, input) {
  const { rowCount } = await db.query(
    `UPDATE compatibility
        SET product_id = $2, model_id = $3, year_from = $4,
            year_to = $5, status = $6, source = $7
      WHERE id = $1`,
    [
      id,
      input.productId,
      input.modelId,
      input.yearFrom,
      input.yearTo,
      input.status,
      input.source,
    ]
  )
  return rowCount > 0 ? getRecord(db, id) : null
}

export async function deleteRecord(db, id) {
  const { rowCount } = await db.query(
    'DELETE FROM compatibility WHERE id = $1',
    [id]
  )
  return rowCount > 0
}
