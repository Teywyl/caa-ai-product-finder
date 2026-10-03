import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  authApi,
  catalogApi,
  productsApi,
} from '../api/index.js'
import {
  getToken,
  setToken,
  whenSignedOut,
} from '../api/client.js'
import {
  readJSON,
  writeJSON,
  removeKey,
} from './storage.js'
import {
  designs,
  DEFAULT_DESIGN,
} from '../data/designs.js'

const AppStateContext = createContext(null)

export const useAppState = () => useContext(AppStateContext)
export { can } from './roles.js'

function applyDesign(id) {
  try {
    const meta = designs.find((design) => design.id === id)
    document.documentElement.dataset.design = id
    document.documentElement.dataset.tone =
      meta?.tone ?? 'dark'
  } catch {
    // The document may be unavailable.
  }
}

const EMPTY_CATALOG = {
  status: 'idle',
  brands: [],
  models: [],
  productCount: 0,
  error: null,
}

export function AppStateProvider({ children }) {
  const [session, setSession] = useState(() => ({
    status: getToken() ? 'checking' : 'signed-out',
    user: null,
  }))

  const [catalog, setCatalog] = useState(EMPTY_CATALOG)

  const [lastVehicle, setLastVehicle] = useState(
    () => readJSON('lastVehicle', null).value
  )

  const [design, setDesignState] = useState(() => {
    const saved = readJSON('design', DEFAULT_DESIGN).value
    const id = designs.some((item) => item.id === saved)
      ? saved
      : DEFAULT_DESIGN

    applyDesign(id)
    return id
  })

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const notify = useCallback((text, tone = 'info') => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text, tone })
    toastTimer.current = setTimeout(
      () => setToast(null),
      4200
    )
  }, [])

  useEffect(
    () => () => clearTimeout(toastTimer.current),
    []
  )

  const setDesign = useCallback((id) => {
    applyDesign(id)
    setDesignState(id)
    writeJSON('design', id)
  }, [])

  const loadCatalog = useCallback(async () => {
    setCatalog((current) => ({
      ...current,
      status:
        current.status === 'ready' ? 'ready' : 'loading',
      error: null,
    }))

    try {
      const [{ brands }, { models }, { products }] =
        await Promise.all([
          catalogApi.brands(),
          catalogApi.models(),
          productsApi.list(),
        ])

      setCatalog({
        status: 'ready',
        brands,
        models,
        productCount: products.length,
        error: null,
      })
    } catch (error) {
      setCatalog((current) =>
        current.status === 'ready'
          ? current
          : {
              ...EMPTY_CATALOG,
              status: 'error',
              error,
            }
      )
    }
  }, [])

  useEffect(() => {
    whenSignedOut((message) => {
      setSession({
        status: 'signed-out',
        user: null,
        message,
      })
      setCatalog(EMPTY_CATALOG)
    })
  }, [])

  useEffect(() => {
    if (session.status !== 'checking') return

    authApi.me().then(
      ({ user }) =>
        setSession({ status: 'signed-in', user }),
      (error) => {
        if (error.status === 401) return

        setSession({
          status: 'signed-out',
          user: null,
          message: error.message,
          offline: true,
        })
      }
    )
  }, [])

  useEffect(() => {
    if (session.status === 'signed-in') loadCatalog()
  }, [session.status, session.user?.id, loadCatalog])

  const login = useCallback(async (email, password) => {
    try {
      const { token, user } = await authApi.login(
        email,
        password
      )

      setToken(token)
      setSession({ status: 'signed-in', user })
      return { ok: true, user }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Clear the local session even if the request fails.
    }

    setToken(null)
    setSession({ status: 'signed-out', user: null })
    setCatalog(EMPTY_CATALOG)
  }, [])

  const updateCurrentUser = useCallback(
    (patch) =>
      setSession((current) =>
        current.user
          ? {
              ...current,
              user: { ...current.user, ...patch },
            }
          : current
      ),
    []
  )

  const rememberVehicle = useCallback((modelId, year) => {
    const vehicle = { modelId, year: year ?? null }
    setLastVehicle(vehicle)
    writeJSON('lastVehicle', vehicle)
  }, [])

  const forgetVehicle = useCallback(() => {
    setLastVehicle(null)
    removeKey('lastVehicle')
  }, [])

  const value = useMemo(
    () => ({
      session,
      currentUser: session.user,
      login,
      logout,
      updateCurrentUser,
      catalog,
      reloadCatalog: loadCatalog,
      lastVehicle,
      rememberVehicle,
      forgetVehicle,
      design,
      setDesign,
      toast,
      notify,
      dismissToast: () => setToast(null),
    }),
    [
      session,
      login,
      logout,
      updateCurrentUser,
      catalog,
      loadCatalog,
      lastVehicle,
      rememberVehicle,
      forgetVehicle,
      design,
      setDesign,
      toast,
      notify,
    ]
  )

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
