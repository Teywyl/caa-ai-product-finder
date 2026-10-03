import express from 'express'
import { HttpError, asyncRoute, parseId } from '../http.js'
import { requireRole } from '../auth.js'
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '../repos/productsRepo.js'
import { validateProduct } from '../validate.js'

export function productRoutes(db) {
  const router = express.Router()
  const canEdit = requireRole('editor', 'admin')

  router.get(
    '/',
    asyncRoute(async (request, response) => {
      response.json({ products: await listProducts(db) })
    })
  )

  router.get(
    '/:id',
    asyncRoute(async (request, response) => {
      const product = await getProduct(db, parseId(request.params.id))
      if (!product) {
        throw new HttpError(404, 'No product with that id.')
      }
      response.json({ product })
    })
  )

  router.post(
    '/',
    canEdit,
    asyncRoute(async (request, response) => {
      const { errors, value } = validateProduct(request.body ?? {})
      if (errors.length) {
        throw new HttpError(400, errors.join('; '))
      }

      const product = await createProduct(db, value)
      response
        .status(201)
        .location(`/api/products/${product.id}`)
        .json({ product })
    })
  )

  router.put(
    '/:id',
    canEdit,
    asyncRoute(async (request, response) => {
      const id = parseId(request.params.id)
      const { errors, value } = validateProduct(request.body ?? {})
      if (errors.length) {
        throw new HttpError(400, errors.join('; '))
      }

      const product = await updateProduct(db, id, value)
      if (!product) {
        throw new HttpError(404, 'No product with that id.')
      }
      response.json({ product })
    })
  )

  router.delete(
    '/:id',
    canEdit,
    asyncRoute(async (request, response) => {
      const removed = await deleteProduct(
        db,
        parseId(request.params.id)
      )
      if (!removed) {
        throw new HttpError(404, 'No product with that id.')
      }
      response.status(204).end()
    })
  )

  return router
}
