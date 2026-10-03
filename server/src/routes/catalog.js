import express from 'express'
import { HttpError, asyncRoute } from '../http.js'
import {
  brandExists,
  getModel,
  listBrands,
  listModels,
  listPendingForModel,
} from '../repos/catalogRepo.js'
import { compatibleProductsRoute } from './compatibleProducts.js'

const SLUG = /^[a-z0-9-]{1,60}$/

export function catalogRoutes(db) {
  const router = express.Router()

  router.get(
    '/brands',
    asyncRoute(async (request, response) => {
      response.json({ brands: await listBrands(db) })
    })
  )

  router.get(
    '/brands/:brandId/models',
    asyncRoute(async (request, response) => {
      const { brandId } = request.params

      if (
        !SLUG.test(brandId) ||
        !(await brandExists(db, brandId))
      ) {
        throw new HttpError(404, 'No brand with that id.')
      }

      response.json({
        models: await listModels(db, { brandId }),
      })
    })
  )

  router.get(
    '/models',
    asyncRoute(async (request, response) => {
      response.json({ models: await listModels(db) })
    })
  )

  router.get(
    '/models/:modelId',
    asyncRoute(async (request, response) => {
      const model = SLUG.test(request.params.modelId)
        ? await getModel(db, request.params.modelId)
        : null

      if (!model) {
        throw new HttpError(404, 'No vehicle model with that id.')
      }

      response.json({ model })
    })
  )

  router.get(
    '/models/:modelId/pending',
    asyncRoute(async (request, response) => {
      const model = SLUG.test(request.params.modelId)
        ? await getModel(db, request.params.modelId)
        : null

      if (!model) {
        throw new HttpError(404, 'No vehicle model with that id.')
      }

      response.json({
        pending: await listPendingForModel(db, model.id),
      })
    })
  )

  router.get(
    '/models/:modelId/products',
    compatibleProductsRoute(db)
  )

  return router
}
