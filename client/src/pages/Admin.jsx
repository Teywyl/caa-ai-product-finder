import { useState } from 'react'
import { useAppState, can } from '../lib/AppState.jsx'
import { roles } from '../lib/roles.js'
import { useApi } from '../lib/useApi.js'
import { usersApi } from '../api/index.js'
import { LoadError, Loading } from '../components/ui.jsx'
import { NotAuthorized } from './Records.jsx'
import { IconPlus, IconTrash } from '../components/Icons.jsx'

const emailOk = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const EMPTY_FORM = {
  name: '',
  email: '',
  role: 'viewer',
  password: '',
}

export function Admin({ navigate }) {
  const { currentUser, notify } = useAppState()
  const allowed = can(currentUser, 'manageUsers')

  const list = useApi(
    async () => allowed ? (await usersApi.list()).users : null,
    [allowed]
  )

  const [changes, setChanges] = useState({})
  const [removing, setRemoving] = useState(null)
  const [resetting, setResetting] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErr, setFormErr] = useState({})
  const [saveErr, setSaveErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (!allowed) {
    return (
      <NotAuthorized
        navigate={navigate}
        need="User administration is for Admin accounts"
      />
    )
  }
  if (list.status === 'loading' && !list.data) {
    return <Loading>Loading accounts…</Loading>
  }
  if (list.status === 'error') {
    return (
      <LoadError
        error={list.error}
        title="Could not load the accounts."
        onRetry={list.reload}
      />
    )
  }

  const users = list.data.map((user) => ({
    ...user,
    ...changes[user.id],
  }))

  const dirtyIds = Object.keys(changes).filter((id) => {
    const original = list.data.find((user) => String(user.id) === id)
    return original && Object.entries(changes[id]).some(
      ([key, value]) => original[key] !== value
    )
  })

  const stage = (id, patch) => {
    setSaveErr('')
    setChanges((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }))
  }

  const run = async (work, doneText) => {
    setBusy(true)
    setSaveErr('')

    try {
      await work()
      if (doneText) notify(doneText)
      return true
    } catch (error) {
      setSaveErr(error.message)
      return false
    } finally {
      setBusy(false)
      list.reload()
    }
  }

  const save = () => run(async () => {
    for (const id of dirtyIds) {
      const original = list.data.find((user) => String(user.id) === id)
      const patch = Object.fromEntries(
        Object.entries(changes[id]).filter(
          ([key, value]) => original[key] !== value
        )
      )

      await usersApi.update(id, patch)
      setChanges((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }, 'User changes saved.')

  const remove = (user) => run(async () => {
    await usersApi.remove(user.id)
    setRemoving(null)
  }, `Removed ${user.name}.`)

  const setPassword = () => {
    if (resetting.password.length < 10) {
      setSaveErr('A new password needs at least 10 characters.')
      return
    }

    const user = users.find((item) => item.id === resetting.id)

    run(async () => {
      await usersApi.update(resetting.id, {
        password: resetting.password,
      })
      setResetting(null)
    }, `Password changed for ${user.name}. Their other sign-ins were ended.`)
  }

  const addUser = async (event) => {
    event.preventDefault()
    const errors = {}
    const email = form.email.trim().toLowerCase()

    if (!form.name.trim()) errors.name = 'Enter a name.'
    if (!emailOk(email)) {
      errors.email = 'Enter a valid email address.'
    } else if (users.some((user) => user.email === email)) {
      errors.email = 'An account with this email already exists.'
    }
    if (form.password.length < 10) {
      errors.password = 'Use at least 10 characters.'
    }

    setFormErr(errors)
    if (Object.keys(errors).length) return

    const ok = await run(
      () => usersApi.create({
        name: form.name.trim(),
        email,
        role: form.role,
        password: form.password,
      }),
      `Added ${form.name.trim()}.`
    )

    if (ok) setForm(EMPTY_FORM)
  }

  return (
    <div className="stack-lg">
      <div className="page-head page-head--row">
        <div>
          <p className="eyebrow">Authorized administrator</p>
          <h1 className="page-title">User administration</h1>
          <p className="muted">
            Manage who can sign in and what they can do.
            Every change is checked again by the server.
          </p>
        </div>
      </div>

      <div className="admin">
        <section
          aria-labelledby="users-title"
          className="stack-md admin-users"
        >
          <h2 id="users-title" className="section-title section-title--sm">
            User list <span className="tab-count">{users.length}</span>
          </h2>

          <ul className="user-list">
            {users.map((user) => {
              const isMe = user.id === currentUser.id

              return (
                <li
                  key={user.id}
                  className={`user-row${user.active ? '' : ' is-inactive'}`}
                >
                  <div className="user-who">
                    <span className="avatar" aria-hidden="true">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="user-text">
                      <strong>
                        {user.name}
                        {isMe && <span className="muted"> (you)</span>}
                      </strong>
                      <span className="muted small user-email">{user.email}</span>
                    </span>
                  </div>
                  <div className="user-controls">
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      Role for {user.name}
                    </label>
                    <select
                      id={`role-${user.id}`}
                      className="input select input--sm"
                      value={user.role}
                      disabled={isMe || busy}
                      onChange={(event) => stage(user.id, {
                        role: event.target.value,
                      })}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>

                    <label className="check check--sm">
                      <input
                        type="checkbox"
                        id={`active-${user.id}`}
                        checked={user.active}
                        disabled={isMe || busy}
                        onChange={(event) => stage(user.id, {
                          active: event.target.checked,
                        })}
                      />
                      <span>Active</span>
                    </label>

                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled={busy}
                      onClick={() => setResetting({
                        id: user.id,
                        password: '',
                      })}
                    >
                      Password
                    </button>

                    {removing === user.id ? (
                      <span className="confirm-inline">
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          disabled={busy}
                          onClick={() => remove(user)}
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setRemoving(null)}
                        >
                          Keep
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        disabled={isMe || busy}
                        onClick={() => setRemoving(user.id)}
                        aria-label={`Remove ${user.name}`}
                      >
                        <IconTrash size={18} />
                      </button>
                    )}
                  </div>

                  {resetting?.id === user.id && (
                    <form
                      className="confirm-inline user-password"
                      onSubmit={(event) => {
                        event.preventDefault()
                        setPassword()
                      }}
                    >
                      <label className="sr-only" htmlFor={`pw-${user.id}`}>
                        New password for {user.name}
                      </label>
                      <input
                        id={`pw-${user.id}`}
                        className="input input--sm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="New password (10+ characters)"
                        value={resetting.password}
                        onChange={(event) => setResetting({
                          ...resetting,
                          password: event.target.value,
                        })}
                      />
                      <button
                        type="submit"
                        className="btn btn--primary btn--sm"
                        disabled={busy}
                      >
                        Set password
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setResetting(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>

          {saveErr && <p className="field-error" role="alert">{saveErr}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={!dirtyIds.length || busy}
              onClick={save}
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={!dirtyIds.length || busy}
              onClick={() => {
                setChanges({})
                setSaveErr('')
              }}
            >
              Discard
            </button>
            {dirtyIds.length > 0 && (
              <span className="muted small">Unsaved changes</span>
            )}
          </div>
        </section>

        <aside className="stack-md admin-side">
          <form
            className="form panel"
            onSubmit={addUser}
            noValidate
            aria-labelledby="add-user-title"
          >
            <h2 id="add-user-title" className="section-title section-title--sm">
              Add authorized user
            </h2>

            <div className="field">
              <label className="field-label" htmlFor="nu-name">Name</label>
              <input
                id="nu-name"
                className="input"
                value={form.name}
                onChange={(event) => setForm({
                  ...form, name: event.target.value,
                })}
                aria-invalid={!!formErr.name}
                aria-describedby={formErr.name ? 'nu-name-error' : undefined}
              />
              {formErr.name && (
                <p className="field-error" id="nu-name-error">{formErr.name}</p>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="nu-email">Email</label>
              <input
                id="nu-email"
                className="input"
                type="email"
                value={form.email}
                onChange={(event) => setForm({
                  ...form, email: event.target.value,
                })}
                aria-invalid={!!formErr.email}
                aria-describedby={formErr.email ? 'nu-email-error' : undefined}
              />
              {formErr.email && (
                <p className="field-error" id="nu-email-error">{formErr.email}</p>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="nu-role">Role</label>
              <select
                id="nu-role"
                className="input select"
                value={form.role}
                onChange={(event) => setForm({
                  ...form, role: event.target.value,
                })}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="nu-password">
                Temporary password
              </label>
              <input
                id="nu-password"
                className="input"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({
                  ...form, password: event.target.value,
                })}
                aria-invalid={!!formErr.password}
                aria-describedby={
                  formErr.password ? 'nu-password-error' : 'nu-password-hint'
                }
              />
              {formErr.password ? (
                <p className="field-error" id="nu-password-error">
                  {formErr.password}
                </p>
              ) : (
                <p className="field-hint" id="nu-password-hint">
                  At least 10 characters. Give it to the person privately.
                  Users cannot change it themselves yet, so set a new one
                  here when asked.
                </p>
              )}
            </div>

            <button type="submit" className="btn btn--primary" disabled={busy}>
              <IconPlus size={16} /> Add user
            </button>
          </form>

          <section className="panel" aria-labelledby="roles-title">
            <h2 id="roles-title" className="section-title section-title--sm">
              Roles and access
            </h2>
            <dl className="roles">
              {roles.map((role) => (
                <div key={role.id}>
                  <dt>{role.name}</dt>
                  <dd className="muted small">{role.summary}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
