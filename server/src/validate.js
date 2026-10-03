export const CATEGORIES = [
  'Evaporator',
  'Cabin Filter',
  'Air Filter',
  'Fuel Filter',
  'Blower Motor',
  'Compressor',
]

export const STOCK_STATUSES = [
  'unconfirmed',
  'in_stock',
  'out_of_stock',
]

export const MARKETPLACES = {
  lazada: 'lazada.',
  shopee: 'shopee.',
  tiktok: 'tiktok.',
}

export const COMPAT_STATUSES = ['confirmed', 'needs_verification']
export const ROLES = ['viewer', 'editor', 'admin']
export const YEAR_MIN = 1980
export const YEAR_MAX = 2100

const text = (value) =>
  typeof value === 'string' ? value.trim() : ''

export function parseYear(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const year = Number(value)
  return Number.isInteger(year) && year >= YEAR_MIN && year <= YEAR_MAX
    ? year
    : NaN
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  )
}

export function validateProduct(body) {
  const errors = []
  const name = text(body.name)
  const category = text(body.category)
  const partNumber = text(body.partNumber)
  const description = text(body.description)
  const listed = body.listed === undefined ? true : body.listed
  const stock =
    body.stock && typeof body.stock === 'object' ? body.stock : {}
  const stockStatus =
    stock.status === undefined ? 'unconfirmed' : stock.status
  const checkedOn = text(stock.checkedOn)
  const price =
    body.pricePhp === undefined ||
    body.pricePhp === null ||
    body.pricePhp === ''
      ? null
      : Number(body.pricePhp)

  if (!name) errors.push('name is required')
  if (name.length > 120) {
    errors.push('name must be 120 characters or fewer')
  }
  if (!CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`)
  }
  if (partNumber.length > 60) {
    errors.push('partNumber must be 60 characters or fewer')
  }
  if (description.length > 2000) {
    errors.push('description must be 2000 characters or fewer')
  }
  if (typeof listed !== 'boolean') {
    errors.push('listed must be true or false')
  }
  if (!STOCK_STATUSES.includes(stockStatus)) {
    errors.push(
      `stock.status must be one of: ${STOCK_STATUSES.join(', ')}`
    )
  }

  if (stockStatus !== 'unconfirmed') {
    if (!isIsoDate(checkedOn)) {
      errors.push(
        'stock.checkedOn must be a date (YYYY-MM-DD) when stock is confirmed'
      )
    } else if (checkedOn > new Date().toISOString().slice(0, 10)) {
      errors.push('stock.checkedOn cannot be in the future')
    }
  }

  if (
    price !== null &&
    (
      !Number.isFinite(price) ||
      price < 0 ||
      price > 10_000_000 ||
      Math.abs(Math.round(price * 100) - price * 100) > 1e-6
    )
  ) {
    errors.push(
      'pricePhp must be a non-negative amount with at most two decimals'
    )
  }

  const links = {}
  const inputLinks =
    body.links && typeof body.links === 'object' ? body.links : {}

  for (const [market, host] of Object.entries(MARKETPLACES)) {
    const url = text(inputLinks[market])

    if (!url) {
      links[market] = null
      continue
    }

    let parsed = null
    try {
      parsed = new URL(url)
    } catch {
      // Report invalid URLs below.
    }

    if (!parsed || parsed.protocol !== 'https:') {
      errors.push(`links.${market} must be a full https:// link`)
    } else if (!parsed.hostname.includes(host)) {
      errors.push(`links.${market} must be a ${market} link`)
    } else if (url.length > 2000) {
      errors.push(`links.${market} is too long`)
    }

    links[market] = url
  }

  return {
    errors,
    value: {
      name,
      category,
      partNumber: partNumber || null,
      description,
      listed,
      stockStatus,
      stockCheckedOn:
        stockStatus === 'unconfirmed' ? null : checkedOn,
      pricePhp: price,
      links,
    },
  }
}

export function validateCompatibility(body) {
  const errors = []
  const productId = Number(body.productId)
  const modelId = text(body.modelId)
  const yearFrom = parseYear(body.yearFrom)
  const yearTo = parseYear(body.yearTo)
  const status = text(body.status)
  const source = text(body.source)

  if (!Number.isSafeInteger(productId) || productId < 1) {
    errors.push('productId must be a product id')
  }
  if (!/^[a-z0-9-]{1,60}$/.test(modelId)) {
    errors.push('modelId must be a vehicle model id')
  }
  if (Number.isNaN(yearFrom)) {
    errors.push(
      `yearFrom must be a year from ${YEAR_MIN} to ${YEAR_MAX}`
    )
  }
  if (Number.isNaN(yearTo)) {
    errors.push(
      `yearTo must be a year from ${YEAR_MIN} to ${YEAR_MAX}`
    )
  }
  if (
    yearFrom === null &&
    yearTo !== null &&
    !Number.isNaN(yearTo)
  ) {
    errors.push('add yearFrom, or leave both years blank')
  }
  if (
    Number.isInteger(yearFrom) &&
    Number.isInteger(yearTo) &&
    yearTo < yearFrom
  ) {
    errors.push('yearTo must be the same as or after yearFrom')
  }
  if (!COMPAT_STATUSES.includes(status)) {
    errors.push(
      `status must be one of: ${COMPAT_STATUSES.join(', ')}`
    )
  }
  if (status === 'confirmed' && yearFrom === null) {
    errors.push('a confirmed record needs at least yearFrom')
  }
  if (status === 'confirmed' && !source) {
    errors.push(
      'a confirmed record needs a source, such as the listing title'
    )
  }
  if (source.length > 1000) {
    errors.push('source must be 1000 characters or fewer')
  }

  return {
    errors,
    value: { productId, modelId, yearFrom, yearTo, status, source },
  }
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function validateNewUser(body) {
  const errors = []
  const name = text(body.name)
  const email = text(body.email).toLowerCase()
  const role = text(body.role)
  const password =
    typeof body.password === 'string' ? body.password : ''

  if (!name || name.length > 80) {
    errors.push('name is required (up to 80 characters)')
  }
  if (!EMAIL.test(email) || email.length > 200) {
    errors.push('email must be a valid email address')
  }
  if (!ROLES.includes(role)) {
    errors.push(`role must be one of: ${ROLES.join(', ')}`)
  }
  if (password.length < 10 || password.length > 200) {
    errors.push('password must be 10 to 200 characters')
  }

  return { errors, value: { name, email, role, password } }
}

export function validateUserChanges(body) {
  const errors = []
  const value = {}

  if (body.name !== undefined) {
    value.name = text(body.name)
    if (!value.name || value.name.length > 80) {
      errors.push('name is required (up to 80 characters)')
    }
  }

  if (body.role !== undefined) {
    value.role = text(body.role)
    if (!ROLES.includes(value.role)) {
      errors.push(`role must be one of: ${ROLES.join(', ')}`)
    }
  }

  if (body.active !== undefined) {
    value.active = body.active
    if (typeof value.active !== 'boolean') {
      errors.push('active must be true or false')
    }
  }

  if (body.password !== undefined) {
    value.password =
      typeof body.password === 'string' ? body.password : ''

    if (value.password.length < 10 || value.password.length > 200) {
      errors.push('password must be 10 to 200 characters')
    }
  }

  if (Object.keys(value).length === 0) {
    errors.push('send at least one of: name, role, active, password')
  }

  return { errors, value }
}

export function validateLogin(body) {
  const email = text(body.email).toLowerCase()
  const password =
    typeof body.password === 'string' ? body.password : ''
  const errors = []

  if (!email || !password) {
    errors.push('email and password are required')
  }
  if (email.length > 200 || password.length > 200) {
    errors.push('email or password is too long')
  }

  return { errors, value: { email, password } }
}
