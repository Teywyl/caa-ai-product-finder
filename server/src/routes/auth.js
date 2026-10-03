import express from 'express'
import { HttpError, asyncRoute } from '../http.js'
import {
  burnPasswordCheck,
  createLoginLimiter,
  hashToken,
  newSessionToken,
  requireAuth,
  verifyPassword,
} from '../auth.js'
import {
  createSession,
  deleteSession,
  findUserForLogin,
} from '../repos/usersRepo.js'
import { validateLogin } from '../validate.js'

export function authRoutes(
  db,
  { sessionHours = 12, limiter = createLoginLimiter() } = {}
) {
  const router = express.Router()

  router.post(
    '/login',
    asyncRoute(async (request, response) => {
      const { errors, value } = validateLogin(request.body ?? {})
      if (errors.length) {
        throw new HttpError(400, errors.join('; '))
      }

      const { email, password } = value

      if (limiter.isBlocked(request.ip, email)) {
        throw new HttpError(
          429,
          'Too many failed sign-ins. Wait 15 minutes and try again.'
        )
      }

      const user = await findUserForLogin(db, email)
      let ok = false

      if (user) {
        ok = await verifyPassword(password, user.password_hash)
      } else {
        await burnPasswordCheck(password)
      }

      if (!ok) {
        limiter.fail(request.ip, email)
        throw new HttpError(401, 'Email or password is incorrect.')
      }

      if (!user.active) {
        throw new HttpError(
          403,
          'This account is turned off. Ask an admin.'
        )
      }

      limiter.reset(request.ip, email)
      const token = newSessionToken()

      await createSession(db, {
        tokenHash: hashToken(token),
        userId: user.id,
        hours: sessionHours,
      })

      response.json({
        token,
        expiresInHours: sessionHours,
        user: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    })
  )

  router.post(
    '/logout',
    requireAuth(db),
    asyncRoute(async (request, response) => {
      await deleteSession(db, request.sessionTokenHash)
      response.status(204).end()
    })
  )

  router.get('/me', requireAuth(db), (request, response) => {
    response.json({ user: request.user })
  })

  return router
}
