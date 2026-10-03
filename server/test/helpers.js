import { readFileSync } from 'node:fs'
import { createPool } from '../db/createPool.js'
import { createApp } from '../src/app.js'
import {
  createLoginLimiter,
  hashPassword,
} from '../src/auth.js'
import { createUser } from '../src/repos/usersRepo.js'

export const ORIGIN = 'http://localhost:5173'
export const PASSWORD = 'correct-horse-battery'

const quietLog = {
  error() {},
  warn() {},
  info() {},
}

export async function startTestServer() {
  const url = process.env.TEST_DATABASE_URL

  if (!url) {
    throw new Error(
      'Set TEST_DATABASE_URL in server/.env to a separate disposable database.'
    )
  }

  if (url === process.env.DATABASE_URL) {
    throw new Error(
      'TEST_DATABASE_URL must not be the same as DATABASE_URL.'
    )
  }

  const db = createPool(url)

  await db.query(
    readFileSync(
      new URL('../db/schema.sql', import.meta.url),
      'utf8'
    )
  )

  await db.query(
    readFileSync(
      new URL('../db/seed.sql', import.meta.url),
      'utf8'
    )
  )

  const passwordHash = await hashPassword(PASSWORD)
  const users = {}

  for (const role of ['admin', 'editor', 'viewer']) {
    users[role] = await createUser(db, {
      name: `Test ${role}`,
      email: `${role}@example.test`,
      role,
      passwordHash,
    })
  }

  const limiter = createLoginLimiter({
    max: 5,
    windowMs: 60_000,
  })

  const app = createApp({
    db,
    corsOrigins: ORIGIN,
    sessionHours: 1,
    limiter,
    log: quietLog,
  })

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })

  const base = `http://127.0.0.1:${server.address().port}`

  async function call(
    path,
    { method = 'GET', body, token, headers = {} } = {}
  ) {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : typeof body === 'string'
            ? body
            : JSON.stringify(body),
    })

    const text = await res.text()
    let parsed = null

    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = text
    }

    return {
      status: res.status,
      body: parsed,
      headers: res.headers,
    }
  }

  async function login(role) {
    const res = await call('/api/auth/login', {
      method: 'POST',
      body: {
        email: `${role}@example.test`,
        password: PASSWORD,
      },
    })

    if (res.status !== 200) {
      throw new Error(`login as ${role} failed: ${res.status}`)
    }

    return res.body.token
  }

  async function stop() {
    await new Promise((resolve) => server.close(resolve))
    await db.end()
  }

  return { db, base, call, login, users, stop }
}
