import { useState } from 'react'
import { useAppState } from '../lib/AppState.jsx'
import { roles } from '../lib/roles.js'
import { Logo } from '../components/Header.jsx'
import { Notice } from '../components/ui.jsx'
import { Arc360 } from '../components/VehicleVisual.jsx'
import { Car3D } from '../components/Car3D.jsx'
import { DesignSwitcher } from '../components/DesignSwitcher.jsx'

export function Login({ onSignedIn, notice }) {
  const { login, design } = useAppState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (em, pw) => {
    setError('')

    if (!em.trim() || !pw) {
      setError('Enter your email and password.')
      return
    }

    setBusy(true)
    const result = await login(em.trim(), pw)
    setBusy(false)

    if (!result.ok) setError(result.error)
    else onSignedIn()
  }

  return (
    <div className="login-page">
      <main className="login-main" id="main">
        <aside className="login-brand on-dark" aria-label="About this app">
          <Logo />
          <div className="login-brand-copy">
            <p className="eyebrow eyebrow--light">Cabalen Auto Aircon</p>
            <p className="login-brand-title">
              Find aircon parts that fit, then open the exact shop listing.
            </p>
          </div>
          <div className="login-brand-art" aria-hidden="true">
            <Arc360 />
            <Car3D
              body="sedan"
              modelUrl={`${import.meta.env.BASE_URL}models/ferrari-f40.glb`}
              label="3D preview of the LB-Works Ferrari F40"
              interactive={false}
              design={design}
              distance={6.4}
            />
          </div>
          <p className="login-brand-note">
            For family and authorized staff only.
          </p>
          <p className="small">
            3D model: <a href="https://sketchfab.com/heynic" target="_blank" rel="noreferrer">vecarz</a>
            {' · '}<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a>
          </p>
        </aside>

        <div className="login-forms">
          <section className="login-card" aria-labelledby="login-title">
            <p className="eyebrow">Private access</p>
            <h1 id="login-title" className="login-title">
              Authorized user login
            </h1>
            <p className="muted">
              For Cabalen Auto Aircon family and staff.
              There is no public sign-up.
            </p>

            {notice && !error && (
              <Notice tone="warn" title="You are signed out.">
                {notice}
              </Notice>
            )}

            <form
              className="form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                submit(email, password)
              }}
            >
              <div className="field">
                <label className="field-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>

              {error && (
                <p className="field-error" id="login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--block btn--lg"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span
                      className="spinner spinner--on-accent"
                      aria-hidden="true"
                    />
                    Signing in…
                  </>
                ) : 'Sign in'}
              </button>
            </form>
          </section>

          <section className="demo-card" aria-labelledby="access-title">
            <h2 id="access-title" className="section-title">
              Who can sign in
            </h2>
            <p className="muted small">
              Accounts are created by an Admin. If you need access or
              forgot your password, ask the shop’s Admin.
            </p>
            <dl className="roles">
              {roles.map((role) => (
                <div key={role.id}>
                  <dt>{role.name}</dt>
                  <dd className="muted small">{role.summary}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>
      <DesignSwitcher />
    </div>
  )
}
