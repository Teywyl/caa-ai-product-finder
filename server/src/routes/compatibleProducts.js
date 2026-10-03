import { HttpError, asyncRoute } from '../http.js'

// Implement GET /api/models/:modelId/products?year=2021.
//
// Required responses:
// 404: vehicle model does not exist.
// 400: year is missing, invalid or outside the model's year range.
// 200: { model, year, matches }.
//
// Available helpers:
// getModel from ../repos/catalogRepo.js
// findCompatibleProducts from ../repos/compatibleProductsRepo.js
// parseYear from ../validate.js
//
// app.js requires a valid login before reaching this route.

export function compatibleProductsRoute(db) {
  return asyncRoute(async (request, response) => {
    throw new HttpError(
      501,
      'Compatible-product search is not built yet.'
    )
  })
}
