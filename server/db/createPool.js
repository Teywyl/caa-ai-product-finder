import pg from 'pg'

export function createPool(connectionString) {
  const hostname = new URL(connectionString).hostname
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'

  const pool = new pg.Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  })

  pool.on('error', (error) => {
    console.error('Unexpected database pool error:', error.message)
  })

  return pool
}
