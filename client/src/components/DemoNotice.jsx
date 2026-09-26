import { USING_MOCK_API } from '../api'

// Shown only while the simulated backend is switched on. It disappears by
// itself the moment you set VITE_USE_MOCK_API=false, because it reads the same
// variable the API layer does.
//
// Leave this in. A deployment that quietly pretends to have a server is the
// difference between a deliberate staging site and a submission hoping nobody
// checks.
export default function DemoNotice() {
  if (!USING_MOCK_API) return null

  return (
    <div className="demo-notice" role="status">
      <strong>Demo mode.</strong> These are sample products bundled with the app.
      Filtering happens in your browser; products cannot be added or edited here.
      The product API and PostgreSQL database are not connected yet. Confirm
      exact vehicle fitment before using a product.
    </div>
  )
}
