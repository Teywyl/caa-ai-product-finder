import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { HttpError, databaseErrorToHttp } from './http.js'
import { requireAuth, requireRole } from './auth.js'
import { authRoutes } from './routes/auth.js'
import { catalogRoutes } from './routes/catalog.js'
import { productRoutes } from './routes/products.js'
import { compatibilityRoutes } from './routes/compatibility.js'
import { userRoutes } from './routes/users.js'
import { finderRoutes } from './routes/finder.js'

export function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter((s) => s && s !== '*')
}

export function createApp({
  db,
  corsOrigins = process.env.CORS_ORIGINS,
  sessionHours = Number(process.env.SESSION_HOURS) || 12,
  limiter,
  log = console,
} = {}) {
  const app = express()
  const allowed = parseOrigins(corsOrigins)

  app.disable('x-powered-by')

  // Configure for a deployment behind one trusted reverse proxy.
  app.set('trust proxy', 1)
  app.use(helmet())

  app.use(
    cors({
      origin: (origin, done) =>
        done(null, !origin || allowed.includes(origin)),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    })
  )

  app.use(express.json({ limit: '100kb' }))

  app.get('/healthz', (request, response) => {
    response.json({ ok: true })
  })

  app.get('/readyz', async (request, response) => {
    try {
      await db.query('SELECT 1')
      response.json({ ok: true })
    } catch (error) {
      log.error('readyz: database not reachable:', error.message)
      response.status(503).json({ ok: false })
    }
  })

  app.use('/api/auth', authRoutes(db, { sessionHours, limiter }))

  const signedIn = requireAuth(db)
  app.use('/api', signedIn)
  app.use('/api', catalogRoutes(db))
  app.use('/api/products', productRoutes(db))
  app.use('/api/compatibility', compatibilityRoutes(db))
  app.use('/api/finder', finderRoutes(db))
  app.use('/api/users', requireRole('admin'), userRoutes(db))

  app.use((request, response) => {
    response.status(404).json({ error: 'Not found.' })
  })

  app.use((error, request, response, next) => {
    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({
        error: 'The request body is not valid JSON.',
      })
    }

    if (error.type === 'entity.too.large') {
      return response.status(413).json({
        error: 'The request body is too large.',
      })
    }

    const known =
      error instanceof HttpError ? error : databaseErrorToHttp(error)

    if (known) {
      if (known !== error) {
        log.warn(
          `${request.method} ${request.path}: database rejected input ` +
            `(${error.code} ${error.constraint ?? ''})`
        )
      }

      return response.status(known.status).json({
        error: known.message,
      })
    }

    log.error(`${request.method} ${request.path} failed:`, error)
    response.status(500).json({
      error: 'Something went wrong on the server. Try again.',
    })
  })

  return app
}
