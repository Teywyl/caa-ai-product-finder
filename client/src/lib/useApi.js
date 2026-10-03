import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

export function useApi(load, deps) {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })

  const [nonce, setNonce] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    const controller = new AbortController()

    setState((s) => ({
      status: 'loading',
      data: s.data,
      error: null,
    }))

    Promise.resolve()
      .then(() => loadRef.current(controller.signal))
      .then(
        (data) => {
          if (!controller.signal.aborted) {
            setState({
              status: 'ok',
              data,
              error: null,
            })
          }
        },
        (error) => {
          if (!controller.signal.aborted) {
            setState({
              status: 'error',
              data: null,
              error,
            })
          }
        }
      )

    return () => controller.abort()
  }, [...deps, nonce])

  const reload = useCallback(
    () => setNonce((n) => n + 1),
    []
  )

  return { ...state, reload }
}
