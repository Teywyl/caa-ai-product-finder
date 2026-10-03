import { useCallback, useEffect, useState } from 'react'

export function parsePath(path) {
  const clean = String(path || '').replace(/^#/, '') || '/'
  const [pathname, qs = ''] = clean.split('?')
  const parts = pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent)
  const query = Object.fromEntries(new URLSearchParams(qs))

  return { path: clean, parts, query }
}

function readHash() {
  try {
    const hash = window.location.hash
    return hash && hash.startsWith('#/')
      ? hash.slice(1)
      : '/'
  } catch {
    return '/'
  }
}

export function useHashRouter() {
  const [route, setRoute] = useState(
    () => parsePath(readHash())
  )

  useEffect(() => {
    const onHash = () => setRoute(parsePath(readHash()))
    window.addEventListener('hashchange', onHash)

    return () =>
      window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback(
    (to, { replace = false } = {}) => {
      const next = parsePath(to)
      setRoute(next)

      try {
        const url = '#' + next.path

        if (replace) {
          window.history.replaceState(null, '', url)
        } else if (window.location.hash !== url) {
          window.location.hash = next.path
        }
      } catch {
        // React state still supports navigation.
      }

      try {
        window.scrollTo({ top: 0 })
      } catch {
        // Scrolling may be unavailable.
      }
    },
    []
  )

  return { route, navigate }
}

export const paths = {
  home: () => '/',
  brands: () => '/brands',
  brand: (brandId) =>
    `/brand/${encodeURIComponent(brandId)}`,
  vehicle: (modelId, year) =>
    `/vehicle/${encodeURIComponent(modelId)}${
      year ? `?year=${year}` : ''
    }`,
  item: (modelId, productId, year) =>
    `/vehicle/${encodeURIComponent(modelId)}/item/${
      encodeURIComponent(productId)
    }${year ? `?year=${year}` : ''}`,
  ai: (q) => `/ai${q ? `?q=${encodeURIComponent(q)}` : ''}`,
  records: () => '/records',
  admin: () => '/admin',
  login: () => '/login',
}
