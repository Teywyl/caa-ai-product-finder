const MODEL_COLUMNS = `
  m.id, m.brand_id, b.name AS brand_name, m.name, m.variant, m.body_type,
  m.year_from, m.year_to, m.aliases, m.reference_label, m.reference_year,
  m.sketchfab_url, m.model_file, m.model_title, m.model_author,
  m.model_author_url, m.model_license, m.model_license_url,
  (SELECT count(DISTINCT c.product_id)::int
     FROM compatibility c
     JOIN products p ON p.id = c.product_id
    WHERE c.model_id = m.id AND c.status = 'confirmed' AND p.listed)
    AS confirmed_product_count`

export function mapModel(row) {
  return {
    id: row.id,
    brandId: row.brand_id,
    brandName: row.brand_name,
    name: row.name,
    variant: row.variant,
    body: row.body_type,
    years: { from: row.year_from, to: row.year_to },
    aliases: row.aliases,
    reference: {
      label: row.reference_label,
      year: row.reference_year,
      sketchfabUrl: row.sketchfab_url,
      model: row.model_file
        ? {
            file: row.model_file,
            title: row.model_title,
            author: row.model_author,
            authorUrl: row.model_author_url,
            license: row.model_license,
            licenseUrl: row.model_license_url,
          }
        : null,
    },
    confirmedProductCount: row.confirmed_product_count,
  }
}

export async function listBrands(db) {
  const { rows } = await db.query(
    `SELECT b.id, b.name, b.logo_url, count(m.id)::int AS model_count
       FROM brands b
       LEFT JOIN vehicle_models m ON m.brand_id = b.id
      GROUP BY b.id
      ORDER BY b.name`
  )

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    logoUrl: r.logo_url,
    modelCount: r.model_count,
  }))
}

export async function brandExists(db, brandId) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM brands WHERE id = $1',
    [brandId]
  )
  return rowCount > 0
}

export async function listModels(db, { brandId } = {}) {
  const { rows } = await db.query(
    `SELECT ${MODEL_COLUMNS}
       FROM vehicle_models m
       JOIN brands b ON b.id = m.brand_id
      WHERE ($1::text IS NULL OR m.brand_id = $1)
      ORDER BY b.name, m.name`,
    [brandId ?? null]
  )
  return rows.map(mapModel)
}

export async function getModel(db, modelId) {
  const { rows } = await db.query(
    `SELECT ${MODEL_COLUMNS}
       FROM vehicle_models m
       JOIN brands b ON b.id = m.brand_id
      WHERE m.id = $1`,
    [modelId]
  )
  return rows[0] ? mapModel(rows[0]) : null
}

export async function listPendingForModel(db, modelId) {
  const { rows } = await db.query(
    `SELECT c.id, c.year_from, c.year_to, c.source,
            p.id AS product_id, p.name, p.category
       FROM compatibility c
       JOIN products p ON p.id = c.product_id
      WHERE c.model_id = $1 AND c.status = 'needs_verification'
      ORDER BY p.name`,
    [modelId]
  )

  return rows.map((r) => ({
    record: {
      id: Number(r.id),
      yearFrom: r.year_from,
      yearTo: r.year_to,
      status: 'needs_verification',
      source: r.source,
    },
    product: {
      id: Number(r.product_id),
      name: r.name,
      category: r.category,
    },
  }))
}
