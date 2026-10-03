import {
  PRODUCT_COLUMNS,
  mapProduct,
  attachLinks,
} from './productsRepo.js'

export async function findCompatibleProducts(db, modelId, year) {
  const { rows } = await db.query(
    `SELECT ${PRODUCT_COLUMNS},
            fit.id AS record_id,
            fit.year_from,
            fit.year_to,
            fit.status AS fit_status,
            fit.source AS fit_source
       FROM products p
       JOIN LATERAL (
         SELECT c.id,
                c.year_from,
                c.year_to,
                c.status,
                c.source
           FROM compatibility c
          WHERE c.product_id = p.id
            AND c.model_id = $1
            AND c.status = 'confirmed'
            AND c.year_from IS NOT NULL
            AND c.year_from <= $2
            AND (c.year_to IS NULL OR c.year_to >= $2)
          ORDER BY c.year_from DESC, c.id ASC
          LIMIT 1
       ) fit ON TRUE
      WHERE p.listed = true
      ORDER BY p.category, p.name, p.id`,
    [modelId, year]
  )

  const products = rows.map(mapProduct)

  await attachLinks(db, products)

  return rows.map((row, index) => ({
    product: products[index],
    record: {
      id: Number(row.record_id),
      yearFrom: row.year_from,
      yearTo: row.year_to,
      status: row.fit_status,
      source: row.fit_source,
    },
  }))
}
