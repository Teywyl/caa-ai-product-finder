const PREFIX = 'caa-finder.'

export function storageAvailable() {
  try {
    const key = PREFIX + '__probe'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)

    if (raw == null) {
      return { value: fallback, status: 'empty' }
    }

    return { value: JSON.parse(raw), status: 'ok' }
  } catch {
    return { value: fallback, status: 'error' }
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(
      PREFIX + key,
      JSON.stringify(value)
    )
    return true
  } catch {
    return false
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    // Storage may be unavailable.
  }
}
