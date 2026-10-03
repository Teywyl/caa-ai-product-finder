import express from 'express'
import { HttpError, asyncRoute, parseId } from '../http.js'
import { requireRole } from '../auth.js'
import {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord,
} from '../repos/compatibilityRepo.js'
import { validateCompatibility } from '../validate.js'

function checked(body) {
  const { errors, value } = validateCompatibility(body ?? {})
  if (errors.length) {
    throw new HttpError(400, errors.join('; '))
  }
  return value
}

export function compatibilityRoutes(db) {
  const router = express.Router()
  const canEdit = requireRole('editor', 'admin')

  router.get(
    '/',
    asyncRoute(async (request, response) => {
      const modelId =
        typeof request.query.modelId === 'string' &&
        request.query.modelId
          ? request.query.modelId
          : null

      response.json({
        records: await listRecords(db, { modelId }),
      })
    })
  )

  router.get(
    '/:id',
    asyncRoute(async (request, response) => {
      const record = await getRecord(db, parseId(request.params.id))
      if (!record) {
        throw new HttpError(
          404,
          'No compatibility record with that id.'
        )
      }
      response.json({ record })
    })
  )

  router.post(
    '/',
    canEdit,
    asyncRoute(async (request, response) => {
      const record = await createRecord(db, checked(request.body))
      response
        .status(201)
        .location(`/api/compatibility/${record.id}`)
        .json({ record })
    })
  )

  router.put(
    '/:id',
    canEdit,
    asyncRoute(async (request, response) => {
      const id = parseId(request.params.id)
      const record = await updateRecord(
        db,
        id,
        checked(request.body)
      )
      if (!record) {
        throw new HttpError(
          404,
          'No compatibility record with that id.'
        )
      }
      response.json({ record })
    })
  )

  router.delete(
    '/:id',
    canEdit,
    asyncRoute(async (request, response) => {
      const removed = await deleteRecord(
        db,
        parseId(request.params.id)
      )
      if (!removed) {
        throw new HttpError(
          404,
          'No compatibility record with that id.'
        )
      }
      response.status(204).end()
    })
  )

  return router
}
