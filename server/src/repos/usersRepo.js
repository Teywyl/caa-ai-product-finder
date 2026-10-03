const PUBLIC_COLUMNS = 'id, name, email, role, active, created_at'

const mapUser = (r) => ({
  id: Number(r.id),
  name: r.name,
  email: r.email,
  role: r.role,
  active: r.active,
  createdAt:
    r.created_at instanceof Date
      ? r.created_at.toISOString()
      : r.created_at,
})

export async function listUsers(db) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY name, id`
  )
  return rows.map(mapUser)
}

export async function getUser(db, id) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id]
  )
  return rows[0] ? mapUser(rows[0]) : null
}

export async function findUserForLogin(db, email) {
  const { rows } = await db.query(
    `SELECT id, name, email, role, active, password_hash
       FROM users
      WHERE email = $1`,
    [email]
  )
  return rows[0] ?? null
}

export async function createUser(db, {
  name,
  email,
  role,
  passwordHash,
}) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, role, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, role, passwordHash]
  )
  return mapUser(rows[0])
}

export async function updateUser(db, id, {
  name,
  role,
  active,
  passwordHash,
}) {
  const { rows } = await db.query(
    `UPDATE users
        SET name = COALESCE($2, name),
            role = COALESCE($3, role),
            active = COALESCE($4, active),
            password_hash = COALESCE($5, password_hash)
      WHERE id = $1
      RETURNING ${PUBLIC_COLUMNS}`,
    [
      id,
      name ?? null,
      role ?? null,
      active ?? null,
      passwordHash ?? null,
    ]
  )
  return rows[0] ? mapUser(rows[0]) : null
}

export async function deleteUser(db, id) {
  const { rowCount } = await db.query(
    'DELETE FROM users WHERE id = $1',
    [id]
  )
  return rowCount > 0
}

export async function countOtherActiveAdmins(db, exceptUserId) {
  const { rows } = await db.query(
    `SELECT count(*)::int AS n
       FROM users
      WHERE role = 'admin' AND active AND id <> $1`,
    [exceptUserId]
  )
  return rows[0].n
}

export async function createSession(db, {
  tokenHash,
  userId,
  hours,
}) {
  await db.query('DELETE FROM sessions WHERE expires_at <= now()')

  await db.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(hours => $3::int))`,
    [tokenHash, userId, hours]
  )
}

export async function deleteSession(db, tokenHash) {
  await db.query(
    'DELETE FROM sessions WHERE token_hash = $1',
    [tokenHash]
  )
}

export async function deleteSessionsForUser(
  db,
  userId,
  { exceptTokenHash = null } = {}
) {
  await db.query(
    `DELETE FROM sessions
      WHERE user_id = $1
        AND ($2::text IS NULL OR token_hash <> $2)`,
    [userId, exceptTokenHash]
  )
}
