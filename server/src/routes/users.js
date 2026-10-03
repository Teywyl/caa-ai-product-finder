import express from 'express'
import { HttpError, asyncRoute, parseId } from '../http.js'
import { hashPassword } from '../auth.js'
import {
  countOtherActiveAdmins,
  createUser,
  deleteSessionsForUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from '../repos/usersRepo.js'
import {
  validateNewUser,
  validateUserChanges,
} from '../validate.js'

export function userRoutes(db) {
  const router = express.Router()

  router.get(
    '/',
    asyncRoute(async (request, response) => {
      response.json({ users: await listUsers(db) })
    })
  )

  router.post(
    '/',
    asyncRoute(async (request, response) => {
      const { errors, value } = validateNewUser(request.body ?? {})
      if (errors.length) {
        throw new HttpError(400, errors.join('; '))
      }

      const user = await createUser(db, {
        ...value,
        passwordHash: await hashPassword(value.password),
      })

      response
        .status(201)
        .location(`/api/users/${user.id}`)
        .json({ user })
    })
  )

  router.patch(
    '/:id',
    asyncRoute(async (request, response) => {
      const id = parseId(request.params.id)
      const { errors, value } = validateUserChanges(
        request.body ?? {}
      )
      if (errors.length) {
        throw new HttpError(400, errors.join('; '))
      }

      const existing = await getUser(db, id)
      if (!existing) {
        throw new HttpError(404, 'No user with that id.')
      }

      const losesAdmin =
        existing.role === 'admin' &&
        existing.active &&
        (
          (value.role && value.role !== 'admin') ||
          value.active === false
        )

      if (losesAdmin && id === request.user.id) {
        throw new HttpError(
          409,
          'You cannot remove your own admin access.'
        )
      }

      if (
        losesAdmin &&
        (await countOtherActiveAdmins(db, id)) === 0
      ) {
        throw new HttpError(409, 'Keep at least one active admin.')
      }

      const passwordHash = value.password
        ? await hashPassword(value.password)
        : null

      const user = await updateUser(db, id, {
        ...value,
        passwordHash,
      })

      if (value.active === false || passwordHash) {
        await deleteSessionsForUser(db, id, {
          exceptTokenHash:
            id === request.user.id
              ? request.sessionTokenHash
              : null,
        })
      }

      response.json({ user })
    })
  )

  router.delete(
    '/:id',
    asyncRoute(async (request, response) => {
      const id = parseId(request.params.id)

      if (id === request.user.id) {
        throw new HttpError(
          409,
          'You cannot delete your own account.'
        )
      }

      const existing = await getUser(db, id)
      if (!existing) {
        throw new HttpError(404, 'No user with that id.')
      }

      if (
        existing.role === 'admin' &&
        existing.active &&
        (await countOtherActiveAdmins(db, id)) === 0
      ) {
        throw new HttpError(409, 'Keep at least one active admin.')
      }

      await deleteUser(db, id)
      response.status(204).end()
    })
  )

  return router
}
