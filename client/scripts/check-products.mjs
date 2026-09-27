// Checks src/api/products.json before you commit it.
//
//   npm run check:products
//
// Errors (exit code 1) are things that would break the app or the future
// database import. Warnings are things that are allowed but not yet honest
// enough to call verified, such as a listing with no source.

// Node's built-in tool for reading a file from disk.
import { readFileSync } from 'node:fs'

// Where the product data is, found relative to this script's own folder.
const FILE = new URL('../src/api/products.json', import.meta.url)
// The four allowed categories, spelled exactly as in products.json.
const CATEGORIES = ['Cabin Filter', 'Compressor', 'Evaporator', 'Blower Motor']
// How many products the finished catalog should have.
const TARGET_COUNT = 50

// Problems found so far; printed at the end.
const errors = []
const warnings = []

// Read the file and turn the JSON text into JavaScript data. Stop at once if
// the JSON is broken (e.g. a missing comma), because nothing else can be checked.
let products
try {
  products = JSON.parse(readFileSync(FILE, 'utf8'))
} catch (error) {
  console.error(`products.json is not valid JSON: ${error.message}`)
  process.exit(1)
}

// The file must be a list [ ... ] of products.
if (!Array.isArray(products)) {
  console.error('products.json must be a JSON array')
  process.exit(1)
}

// True for a whole number in a sensible car-year range, e.g. 2010.
const isYear = (value) => Number.isInteger(value) && value >= 1950 && value <= 2100
// IDs met so far, used to spot duplicates.
const seenIds = new Set()

// Check each product one at a time.
products.forEach((product, index) => {
  // How the product is named in messages, e.g. "#4 (product-4)".
  const where = `#${index + 1} (${product.id ?? 'no id'})`

  // ID: must look like "product-12" and must not repeat.
  if (typeof product.id !== 'string' || !/^product-\d+$/.test(product.id)) {
    errors.push(`${where}: id must look like "product-12"`)
  } else if (seenIds.has(product.id)) {
    errors.push(`${where}: duplicate id`)
  }
  seenIds.add(product.id)

  // Name: required, and not just spaces.
  if (typeof product.name !== 'string' || !product.name.trim()) {
    errors.push(`${where}: name is required`)
  }

  // Category: should be one of the four (a warning, so a typo is noticed).
  if (!CATEGORIES.includes(product.category)) {
    warnings.push(`${where}: category "${product.category}" is not one of ${CATEGORIES.join(', ')}`)
  }

  // Text fields: text, or null when unknown. A missing field is an error too.
  for (const field of ['part_number', 'brand', 'model', 'description']) {
    const value = product[field]
    if (value !== null && typeof value !== 'string') {
      errors.push(`${where}: ${field} must be text or null`)
    }
  }

  // Years: a whole year or null (not text like "2010"), and start not after end.
  for (const field of ['year_start', 'year_end']) {
    const value = product[field]
    if (value !== null && !isYear(value)) {
      errors.push(`${where}: ${field} must be a whole year or null`)
    }
  }
  if (isYear(product.year_start) && isYear(product.year_end) &&
      product.year_start > product.year_end) {
    errors.push(`${where}: year_start is after year_end`)
  }

  // Sources: optional list of links. None = warning (shown as unverified).
  // Each link must be https, and checked_on must be a date like 2026-09-27.
  if (product.sources !== undefined && !Array.isArray(product.sources)) {
    errors.push(`${where}: sources must be an array`)
  } else if (!product.sources?.length) {
    warnings.push(`${where}: no source recorded, so it shows as unverified`)
  } else {
    product.sources.forEach((source, n) => {
      if (typeof source?.url !== 'string' || !source.url.startsWith('https://')) {
        errors.push(`${where}: sources[${n}].url must start with https://`)
      }
      if (source?.checked_on !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(source.checked_on)) {
        errors.push(`${where}: sources[${n}].checked_on must be YYYY-MM-DD`)
      }
    })
  }
})

// Count products per category, starting each at 0.
const counts = Object.fromEntries(CATEGORIES.map((name) => [name, 0]))
for (const product of products) {
  if (product.category in counts) counts[product.category] += 1
}

// Print the report.
console.log(`${products.length} of ${TARGET_COUNT} products`)
for (const [name, count] of Object.entries(counts)) console.log(`  ${name}: ${count}`)
for (const warning of warnings) console.log(`warning: ${warning}`)
for (const error of errors) console.log(`error:   ${error}`)
console.log(`${errors.length} errors, ${warnings.length} warnings`)

// Exit code 1 means "failed", so other tools (or you) can tell errors happened.
process.exitCode = errors.length > 0 ? 1 : 0
