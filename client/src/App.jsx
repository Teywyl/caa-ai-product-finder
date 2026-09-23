import { useEffect, useState } from 'react'
import { listProducts } from './api'
import DemoNotice from './components/DemoNotice.jsx'

export default function App() {
  const [status, setStatus] = useState('loading')
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  async function loadProducts() {
    setStatus('loading')
    setError(null)

    try {
      const rows = await listProducts()
      setProducts(rows)
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
          <h2>Sample products</h2>
          <ul className="list">
            {products.map((product) => (
              <li key={product.id} className="card">
                <h3>{product.name}</h3>
                <p>Part number: {product.part_number}</p>
                <p>
                  {product.brand} {product.model} · {product.year_start}–{product.year_end}
                </p>
                <button onClick={() => setSelected(product)}>
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
          <button onClick={() => setSelected(null)}>Close details</button>
        </section>
      )}
    </div>
  )
}