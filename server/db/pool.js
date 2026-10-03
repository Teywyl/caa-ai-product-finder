import { createPool } from './createPool.js'

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Locally: copy .env.example to .env and fill it in. ' +
      'On a host: add it in the dashboard, then redeploy.'
  )
  process.exit(1)
}

export const pool = createPool(process.env.DATABASE_URL)
