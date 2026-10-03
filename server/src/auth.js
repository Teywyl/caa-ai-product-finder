import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'
import { HttpError, asyncRoute } from './http.js'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64
const COST = { N: 16384, r: 8, p: 1 }

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, KEY_LENGTH, COST)

  return [
    'scrypt',
    COST.N,
    COST.r,
    COST.p,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$')
}

export async function verifyPassword(password, stored) {
  const [scheme, N, r, p, salt, hash] = String(stored).split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false

  const expected = Buffer.from(hash, 'base64')
  const key = await scrypt(
    password,
    Buffer.from(salt, 'base64'),
    expected.length,
    { N: Number(N), r: Number(r), p: Number(p) }
  )

  return timingSafeEqual(key, expected)
}

// Also perform a password check when the email is unknown.
let dummyHash = null

export async function burnPasswordCheck(password) {
  dummyHash ??= await hashPassword('not-a-real-password')
  await verifyPassword(password, dummyHash)
}

export const newSessionToken = () =>
  randomBytes(32).toString('base64url')

export const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex')

const bearer = (request) => {
  const header = request.get('authorization') || ''
  const match = header.match(/^Bearer ([A-Za-z0-9_-]{20,200})$/)
  return match ? match[1] : null
}

export function requireAuth(db) {
  return asyncRoute(async (request, response, next) => {
    const token = bearer(request)

    if (!token) {
      throw new HttpError(401, 'Sign in to continue.')
    }

    const tokenHash = hashToken(token)
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.role
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1
          AND s.expires_at > now()
          AND u.active`,
      [tokenHash]
    )

    if (rows.length === 0) {
      throw new HttpError(
        401,
        'Your sign-in has expired. Sign in again.'
      )
    }

    request.user = { ...rows[0], id: Number(rows[0].id) }
    request.sessionTokenHash = tokenHash
    next()
  })
}

export const requireRole =
  (...roles) =>
  (request, response, next) => {
    if (!roles.includes(request.user?.role)) {
      return next(
        new HttpError(403, 'Your account does not have access to this.')
      )
    }

    next()
  }

// Limit failures for each email and IP address.
// This in-memory limit resets when the server restarts.
export function createLoginLimiter({
  max = 5,
  windowMs = 15 * 60 * 1000,
} = {}) {
  const failures = new Map()
  const key = (ip, email) => `${ip}|${email}`

  const prune = (now) => {
    for (const [k, v] of failures) {
      if (now - v.first > windowMs) failures.delete(k)
    }
  }

  return {
    isBlocked(ip, email) {
      const now = Date.now()
      prune(now)
      const entry = failures.get(key(ip, email))
      return !!entry && entry.count >= max
    },

    fail(ip, email) {
      const k = key(ip, email)
      const entry = failures.get(k) || {
        count: 0,
        first: Date.now(),
      }

      entry.count += 1
      failures.set(k, entry)
    },

    reset(ip, email) {
      failures.delete(key(ip, email))
    },
  }
}
