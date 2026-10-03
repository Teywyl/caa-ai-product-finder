import { HttpError } from '../http.js'

// Implement the confirmed-compatibility query here.
//
// Required rules:
// 1. Match the requested model ID.
// 2. Include only confirmed compatibility records.
// 3. Include only products listed by CAA.
// 4. Require year >= year_from.
// 5. Require year <= year_to, unless year_to is null (onward).
// 6. Exclude records with no starting year.
// 7. Return each product once.
// 8. Use SQL parameters for modelId and year.
//
// Return an array of:
// {
//   product: mapped product with marketplace links,
//   record: { id, yearFrom, yearTo, status, source }
// }
//
// Sort by product category, then product name.
// Available helpers in productsRepo.js:
// PRODUCT_COLUMNS, mapProduct, attachLinks.

export async function findCompatibleProducts(db, modelId, year) {
  throw new HttpError(
    501,
    'Compatible-product search is not built yet.'
  )
}
