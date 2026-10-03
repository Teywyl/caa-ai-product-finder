import { parseArgs } from 'node:util'
import { createInterface } from 'node:readline/promises'
import { pool } from '../db/pool.js'
import { hashPassword } from '../src/auth.js'
import { validateNewUser } from '../src/validate.js'
import { createUser } from '../src/repos/usersRepo.js'

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', default: 'viewer' },
  },
})

async function askPassword() {
  if (process.env.NEW_USER_PASSWORD) {
    return process.env.NEW_USER_PASSWORD
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    return await rl.question('Password (10+ characters): ')
  } finally {
    rl.close()
  }
}

try {
  const { errors, value } = validateNewUser({
    ...values,
    password: await askPassword(),
  })

  if (errors.length) {
    console.error(`Not created:\n - ${errors.join('\n - ')}`)
    process.exitCode = 1
  } else {
    const user = await createUser(pool, {
      ...value,
      passwordHash: await hashPassword(value.password),
    })

    console.log(
      `Created ${user.role} account for ${user.email} (id ${user.id}).`
    )
  }
} catch (error) {
  console.error(
    error.code === '23505'
      ? 'An account with that email already exists.'
      : `Failed: ${error.message}`
  )
  process.exitCode = 1
} finally {
  await pool.end()
}
