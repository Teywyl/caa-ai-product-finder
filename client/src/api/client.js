import {
  readJSON,
  removeKey,
  writeJSON,
} from '../lib/storage.js'

const BASE = (import.meta.env.VITE_API_BASE_URL || '')
  .replace(/\/+$/, '')

const TOKEN_KEY = 'token'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

let token = readJSON(TOKEN_KEY, null).value
let onSignedOut = () => {}

export const getToken = () => token

export function setToken(next) {
  token = next

  if (next) {
    writeJSON(TOKEN_KEY, next)
  } else {
    removeKey(TOKEN_KEY)
  }
}

export function whenSignedOut(callback) {
  onSignedOut = callback
}

const FRIENDLY = {
  0: 'Cannot reach the server. Check your connection or try again shortly.',
  429: 'Too many attempts. Wait a few minutes and try again.',
  500: 'Something went wrong on the server. Try again.',
  501: 'This part of the server is not built yet.',
  502: 'The server is not responding. Try again in a minute.',
  503: 'The server is not ready. Try again in a minute.',
}

export async function request(
  path,
  { method = 'GET', body, signal } = {}
) {
  let response

  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, FRIENDLY[0])
  }

  if (response.status === 204) return null

  let data = null

  try {
    data = await response.json()
  } catch {
    // A proxy or host may return a non-JSON error response.
  }

  if (!response.ok) {
    const message =
      data?.error ||
      FRIENDLY[response.status] ||
      `Request failed (${response.status}).`

    if (
      response.status === 401 &&
      token &&
      !path.startsWith('/auth/login')
    ) {
      setToken(null)
      onSignedOut(message)
    }

    throw new ApiError(response.status, message)
  }

  return data
}
