// The main page of the app: loads the products, shows the filters, the product
// list, and the details of the selected product.

// React tools: useState remembers values between screen updates; useEffect runs
// code after the page first appears.
import { useEffect, useState } from 'react'
// Gets the products from demo data or the real API (chosen in src/api/index.js).
import { listProducts } from './api'
// The yellow "Demo mode" box shown while the app uses sample data.
import DemoNotice from './components/DemoNotice.jsx'

// Unknown information is stored as null. These helpers say so plainly instead
// of showing "null" or a bare dash.

// True only when both the first and last model year are known.
const hasYears = (product) => product.year_start != null && product.year_end != null

// Text for the year range, e.g. "2006–2011", or "Years unverified" if unknown.
function yearLabel(product) {
  return hasYears(product) ? `${product.year_start}–${product.year_end}` : 'Years unverified'
}

// Text for the vehicle, e.g. "Honda Civic FD", or a warning if both are unknown.
function vehicleLabel(product) {
  const vehicle = [product.brand, product.model].filter(Boolean).join(' ')
  return vehicle || 'Vehicle fitment unverified'
}

// Does this product fit the typed year? No year typed means every product fits.
// A product with unknown years cannot be shown as a match for a specific year.
function fitsYear(product, year) {
  if (!year) return true
  if (!hasYears(product)) return false
  return Number(year) >= product.year_start && Number(year) <= product.year_end
}

// The whole page. React calls this again every time a state value changes.
export default function App() {
  // Page state: loading / ready / error, the product list, and any error.
  const [status, setStatus] = useState('loading')
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  // The product whose details are open (null = none open).
  const [selected, setSelected] = useState(null)
  // The current filter choices ('' = no filter).
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')

  // Dropdown options: each category and brand once, sorted A–Z, skipping unknowns.
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort()
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort()
  // Model options only for the chosen brand, so "Vios" doesn't appear under Honda.
  const models = [...new Set(products
    .filter((product) => !brand || product.brand === brand)
    .map((product) => product.model)
    .filter(Boolean))].sort()
  // Products that pass the category, brand, and model filters.
  const matchesExceptYear = products.filter((product) =>
    (!category || product.category === category) &&
    (!brand || product.brand === brand) &&
    (!model || product.model === model)
  )
  // Of those, the ones that also fit the typed year: this is what the list shows.
  const matches = matchesExceptYear.filter((product) => fitsYear(product, year))
  // How many were left out only because their years are unknown (told to the user).
  const hiddenUnknownYears = year
    ? matchesExceptYear.filter((product) => !hasYears(product)).length
    : 0

  // Fetches the products and updates the page state (also used by "Try again").
  async function loadProducts() {
    setStatus('loading')
    setError(null)

    try {
      const rows = await listProducts()
      setProducts(rows)
      setSelected(null)
      setStatus('ready')
    } catch (caught) {
      setError(caught)
      setStatus('error')
    }
  }

  // Load the products once, when the page first opens.
  useEffect(() => {
    loadProducts()
  }, [])

  // What appears on screen.
  return (
    <div className="page">
      {/* Title and one-line description */}
      <header>
        <h1>CAA AI Product Finder</h1>
        <p className="lede">
          Find sample car air-conditioning products for Cabalen Auto Aircon.
        </p>
      </header>

      {/* Demo mode warning (hides itself when the real API is used) */}
      <DemoNotice />

      {/* While waiting for the products */}
      {status === 'loading' && <p className="muted">Loading products...</p>}

      {/* If loading failed: the message and a retry button */}
      {status === 'error' && (
        <p className="error" role="alert">
          {error?.message} <button onClick={loadProducts}>Try again</button>
        </p>
      )}

      {/* Loaded, but the list is empty */}
      {status === 'ready' && products.length === 0 && (
        <p className="muted">No products are listed yet.</p>
      )}

      {/* Loaded with products: filters and product list */}
      {status === 'ready' && products.length > 0 && (
        <section>
          {/* Filter box */}
          <div className="card">
            <h2>Find a sample product</h2>
            <div className="filters">
              {/* Category dropdown */}
              <div>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value)
                    setSelected(null)
                  }}
                >
                  <option value="">All categories</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              {/* Brand dropdown; changing it resets the model, which may not exist for the new brand */}
              <div>
                <label htmlFor="brand">Car brand</label>
                <select
                  id="brand"
                  value={brand}
                  onChange={(event) => {
                    setBrand(event.target.value)
                    setModel('')
                    setSelected(null)
                  }}
                >
                  <option value="">All brands</option>
                  {brands.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              {/* Model dropdown (only models of the chosen brand) */}
              <div>
                <label htmlFor="model">Car model</label>
                <select
                  id="model"
                  value={model}
                  onChange={(event) => {
                    setModel(event.target.value)
                    setSelected(null)
                  }}
                >
                  <option value="">All models</option>
                  {models.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              {/* Year box */}
              <div>
                <label htmlFor="year">Model year</label>
                <input
                  id="year"
                  type="number"
                  min="1900"
                  max="2100"
                  placeholder="e.g. 2010"
                  value={year}
                  onChange={(event) => {
                    setYear(event.target.value)
                    setSelected(null)
                  }}
                />
              </div>
            </div>
            {/* Resets every filter and closes the details */}
            <button
              type="button"
              onClick={() => {
                setCategory('')
                setBrand('')
                setModel('')
                setYear('')
                setSelected(null)
              }}
            >
              Clear filters
            </button>
            {/* Result count; role="status" lets screen readers announce it */}
            <p className="muted" role="status">
              {matches.length} sample {matches.length === 1 ? 'product' : 'products'} found.
              Confirm exact fitment before use.
            </p>
            {/* Honest note about products hidden because their years are unknown */}
            {hiddenUnknownYears > 0 && (
              <p className="muted">
                {hiddenUnknownYears} other {hiddenUnknownYears === 1 ? 'product has' : 'products have'} unverified
                model years and {hiddenUnknownYears === 1 ? 'is' : 'are'} not shown for a specific year.
              </p>
            )}
          </div>
          {/* Product list */}
          <h2>Sample products</h2>
          {matches.length === 0 && (
            <p className="muted">No sample products match these filters.</p>
          )}
          <ul className="list">
            {/* One card per matching product */}
            {matches.map((product) => (
              <li key={product.id} className="card">
                <h3>{product.name}</h3>
                <p>Part number: {product.part_number ?? 'unverified'}</p>
                <p>
                  {vehicleLabel(product)} · {yearLabel(product)}
                </p>
                {/* Shown when the product has no source link yet */}
                {!product.sources?.length && <p className="muted">No source recorded · unverified</p>}
                <button type="button" onClick={() => setSelected(product)}>
                  View details
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Details of the selected product */}
      {selected && (
        <section className="card">
          <h2>{selected.name}</h2>
          <p>Category: {selected.category}</p>
          <p>Part number: {selected.part_number ?? 'unverified'}</p>
          <p>Vehicle: {vehicleLabel(selected)} · {yearLabel(selected)}</p>
          <p>{selected.description}</p>
          {/* Source links, or a warning when there are none */}
          <h3>Sources</h3>
          {selected.sources?.length ? (
            <ul>
              {selected.sources.map((source) => (
                <li key={source.url}>
                  {/* target="_blank" opens a new tab; rel="noreferrer" stops that site from controlling this tab */}
                  <a href={source.url} target="_blank" rel="noreferrer">{source.label || source.url}</a>
                  {source.checked_on && ` (checked ${source.checked_on})`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No source recorded. Treat this listing as unverified.</p>
          )}
          <button type="button" onClick={() => setSelected(null)}>Close details</button>
        </section>
      )}
    </div>
  )
}
