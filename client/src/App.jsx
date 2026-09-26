import { useEffect, useState } from 'react'
import { listProducts } from './api'
import DemoNotice from './components/DemoNotice.jsx'

export default function App() {
  const [status, setStatus] = useState('loading')
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')

  const brands = [...new Set(products.map((product) => product.brand))].sort()
  const models = [...new Set(products
    .filter((product) => !brand || product.brand === brand)
    .map((product) => product.model))].sort()
  const matches = products.filter((product) =>
    (!brand || product.brand === brand) &&
    (!model || product.model === model) &&
    (!year || (Number(year) >= product.year_start && Number(year) <= product.year_end))
  )

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

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="page">
      <header>
        <h1>CAA AI Product Finder</h1>
        <p className="lede">
          Find sample car air-conditioning products for Cabalen Auto Aircon.
        </p>
      </header>

      <DemoNotice />

      {status === 'loading' && <p className="muted">Loading products...</p>}

      {status === 'error' && (
        <p className="error" role="alert">
          {error?.message} <button onClick={loadProducts}>Try again</button>
        </p>
      )}

      {status === 'ready' && products.length === 0 && (
        <p className="muted">No products are listed yet.</p>
      )}

      {status === 'ready' && products.length > 0 && (
        <section>
          <div className="card">
            <h2>Find a sample product</h2>
            <div className="filters">
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
            <button
              type="button"
              onClick={() => {
                setBrand('')
                setModel('')
                setYear('')
                setSelected(null)
              }}
            >
              Clear filters
            </button>
            <p className="muted" role="status">
              {matches.length} sample {matches.length === 1 ? 'product' : 'products'} found.
              Confirm exact fitment before use.
            </p>
          </div>
          <h2>Sample products</h2>
          {matches.length === 0 && (
            <p className="muted">No sample products match these filters.</p>
          )}
          <ul className="list">
            {matches.map((product) => (
              <li key={product.id} className="card">
                <h3>{product.name}</h3>
                <p>Part number: {product.part_number}</p>
                <p>
                  {product.brand} {product.model} · {product.year_start}–{product.year_end}
                </p>
                <button type="button" onClick={() => setSelected(product)}>
                  View details
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selected && (
        <section className="card">
          <h2>{selected.name}</h2>
          <p>Category: {selected.category}</p>
          <p>Part number: {selected.part_number}</p>
          <p>{selected.description}</p>
          <button type="button" onClick={() => setSelected(null)}>Close details</button>
        </section>
      )}
    </div>
  )
}