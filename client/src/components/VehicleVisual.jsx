import { useEffect, useId, useRef, useState } from 'react'
import { IconCube, IconExternal, IconRotate } from './Icons.jsx'
import { Car3D } from './Car3D.jsx'
import { useAppState } from '../lib/AppState.jsx'
import { vehicleLabel } from '../lib/match.js'
import { BODIES } from '../lib/bodies.js'

function Wheel({ x }) {
  const spokes = [0, 72, 144, 216, 288]

  return (
    <g>
      <circle cx={x} cy="128" r="27" className="car-arch" />
      <circle cx={x} cy="128" r="22" className="car-tyre" />
      <circle cx={x} cy="128" r="14.5" className="car-rim" />
      {spokes.map((angle) => (
        <path
          key={angle}
          d={`M${x} 128 L${x} 115`}
          className="car-spoke"
          transform={`rotate(${angle} ${x} 128)`}
        />
      ))}
      <circle cx={x} cy="128" r="4" className="car-hubcap" />
    </g>
  )
}

export function VehicleSilhouette({
  body = 'sedan',
  title,
  className = '',
}) {
  const shape = BODIES[body] || BODIES.sedan
  const gid = useId().replace(/:/g, '')

  return (
    <svg
      className={`silhouette ${className}`}
      viewBox="0 0 400 170"
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <radialGradient id={`floor-${gid}`} cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            className="car-floor-stop"
            stopOpacity="0.55"
          />
          <stop
            offset="100%"
            className="car-floor-stop"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>
      <ellipse
        cx="200"
        cy="152"
        rx="196"
        ry="12"
        fill={`url(#floor-${gid})`}
        className="car-floor"
      />
      {shape.spare && (
        <g>
          <circle cx="40" cy="88" r="18" className="car-tyre" />
          <circle cx="40" cy="88" r="10" className="car-rim" />
        </g>
      )}
      <path d={shape.body} className="car-body" />
      {shape.rails && <path d={shape.rails} className="car-trim" />}
      {shape.glass.map((path, index) => (
        <path key={index} d={path} className="car-glass" />
      ))}
      <path d={shape.line} className="car-line" />
      <path d={shape.lamp} className="car-lamp" />
      {shape.bed && <path d={shape.bed} className="car-seam" />}
      {shape.spoiler && <path d={shape.spoiler} className="car-trim" />}
      {shape.wheels.map((x) => <Wheel key={x} x={x} />)}
    </svg>
  )
}

export function Arc360() {
  return null;
}

const sketchfabUid = (url) => {
  const match = String(url || '').match(/([0-9a-f]{32})\/?$/i)
  return match ? match[1] : null
}

export const BODY_NAMES = {
  suv: 'SUV',
  pickup: 'pickup',
  sedan: 'sedan',
  mpv: 'MPV',
  mini: 'compact hatchback',
  offroad: 'compact 4x4',
  hatch: 'hatchback',
}

export function VehicleStage({
  model,
  children,
  compact = false,
  brandSlot,
  word,
}) {
  const { design } = useAppState()
  const [mode, setMode] = useState('3d')
  const [viewer, setViewer] = useState('idle')
  const timer = useRef(null)
  const uid = sketchfabUid(model.reference.sketchfabUrl)
  const name = vehicleLabel(model)

  useEffect(() => {
    setMode('3d')
    setViewer('idle')
    clearTimeout(timer.current)
  }, [model.id])

  useEffect(() => {
    if (mode !== 'real') return undefined

    const onViolation = (event) => {
      if (String(event.blockedURI || '').includes('sketchfab')) {
        setViewer('failed')
      }
    }

    document.addEventListener('securitypolicyviolation', onViolation)
    return () =>
      document.removeEventListener('securitypolicyviolation', onViolation)
  }, [mode])

  useEffect(() => () => clearTimeout(timer.current), [])

  const openReal = () => {
    setMode('real')

    if (
      !uid ||
      (typeof navigator !== 'undefined' && navigator.onLine === false)
    ) {
      setViewer('failed')
      return
    }

    setViewer('loading')
    clearTimeout(timer.current)
    timer.current = setTimeout(
      () => setViewer((current) =>
        current === 'loading' ? 'failed' : current
      ),
      15000
    )
  }

  const refText =
    `${model.reference.label}${
      model.reference.year ? '' : ' (year not stated)'
    }`

  const bodyName = BODY_NAMES[model.body] || 'vehicle'
  const exact = model.reference.model || null

  return (
    <section
      className={`stage on-dark${compact ? ' stage--compact' : ''}`}
      aria-label={`${name} vehicle preview`}
      data-mode={mode}
    >
      <div className="stage-top">
        {brandSlot}
        <span className="stage-tag">
          {mode === 'real'
            ? 'Sketchfab viewer'
            : exact ? 'Exact 3D model' : 'Stylised 3D'}
        </span>
      </div>

      <div className="stage-body">
        <div className="stage-visual" data-mode={mode}>
          {word && mode === '3d' && (
            <span className="stage-word" aria-hidden="true">{word}</span>
          )}

          {mode === '3d' && (
            <>
              {!compact && <Arc360 />}
              <Car3D
                body={model.body}
                modelUrl={exact?.file}
                label={
                  exact
                    ? `3D model of the ${exact.title}`
                    : `3D preview of a ${bodyName} representing the ${name}`
                }
                design={design}
                distance={compact ? 7.2 : 6.6}
                className="stage-car"
              />
              <p className="stage-drag" aria-hidden="true">
                <IconRotate size={14} /> Drag to rotate 360°
              </p>
            </>
          )}

          {mode === 'real' && viewer !== 'failed' && uid && (
            <iframe
              key={uid}
              className="stage-frame"
              title={`3D model of ${model.reference.label} on Sketchfab`}
              src={`https://sketchfab.com/models/${uid}/embed?autostart=1&ui_hint=0&dnt=1&ui_theme=dark`}
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
              onLoad={() => {
                clearTimeout(timer.current)
                setViewer((current) =>
                  current === 'failed' ? current : 'ready'
                )
              }}
            />
          )}

          {mode === 'real' && viewer === 'loading' && (
            <div className="stage-overlay" role="status">
              <span
                className="spinner spinner--light"
                aria-hidden="true"
              />
              Loading the Sketchfab model…
            </div>
          )}

          {mode === 'real' && viewer === 'failed' && (
            <div className="stage-overlay stage-failed" role="status">
              <div className="stage-art stage-art--dim" aria-hidden="true">
                <VehicleSilhouette
                  body={model.body}
                  className="silhouette--stage"
                />
              </div>
              <p className="stage-failed-text">
                <strong>The Sketchfab viewer is unavailable.</strong>
                <span>
                  The viewer may be blocked or unavailable. Open it on
                  Sketchfab, or switch back to the 3D view.
                </span>
              </p>
            </div>
          )}
        </div>

        {children && <div className="stage-info">{children}</div>}
      </div>

      <div className="stage-bar">
        <div
          className="seg seg--dark"
          role="group"
          aria-label="Vehicle view"
        >
          <button
            type="button"
            className="seg-btn"
            aria-pressed={mode === '3d'}
            onClick={() => setMode('3d')}
          >
            <IconRotate size={16} /> 3D view
          </button>
          <button
            type="button"
            className="seg-btn"
            aria-pressed={mode === 'real'}
            onClick={openReal}
          >
            <IconCube size={16} /> Sketchfab
          </button>
        </div>

        <p className="stage-ref">
          {mode === '3d' && exact ? (
            <>
              3D model: “{exact.title}” by{' '}
              <a
                href={exact.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {exact.author}
              </a>
              , licensed under{' '}
              <a
                href={exact.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {exact.license}
              </a>
              . Shown for the model, not each year.
            </>
          ) : mode === '3d' ? (
            `Stylised ${bodyName} shape, not an exact replica. Reference: ${refText}. Not year-specific.`
          ) : (
            `Sketchfab model: ${refText}. Shown for the model, not each year.`
          )}
        </p>

        <div className="stage-links">
          {mode === 'real' && viewer === 'failed' && uid && (
            <button
              type="button"
              className="link-btn link-btn--light"
              onClick={openReal}
            >
              <IconRotate size={16} /> Retry
            </button>
          )}
          <a
            className="link-btn link-btn--light"
            href={model.reference.sketchfabUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on Sketchfab <IconExternal size={15} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  )
}
