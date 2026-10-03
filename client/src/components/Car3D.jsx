import { useEffect, useRef, useState } from 'react'
import { createCarRenderer, hexToRgb } from '../lib/car3d.js'
import { VehicleSilhouette } from './VehicleVisual.jsx'

function readColors(element) {
  const styles = getComputedStyle(element)
  const value = (name) => styles.getPropertyValue(name).trim()
  const number = (name, fallback) => {
    const parsed = parseFloat(value(name))
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return {
    paint: hexToRgb(value('--car-paint'), [0.9, 0.94, 0.94]),
    glass: hexToRgb(value('--car-glass'), [0, 0.2, 0.23]),
    rim: hexToRgb(value('--car-rim'), [0, 0.72, 0.71]),
    glow: hexToRgb(value('--car-glow'), [0, 0.72, 0.71]),
    sky: hexToRgb(value('--car-sky'), [0.66, 0.85, 0.85]),
    floor: hexToRgb(value('--car-floor'), [0.01, 0.1, 0.12]),
    matte: hexToRgb(value('--car-matte'), [0.05, 0.08, 0.09]),
    shadow: hexToRgb(value('--car-shadow'), [0, 0.05, 0.06]),
    ring: number('--car-ring', 0.6),
    glowAmt: number('--car-glow-amt', 0.5),
    zoom: number('--car-zoom', 1),
  }
}

export function Car3D({
  body,
  label,
  interactive = true,
  autoRotate = true,
  distance,
  design,
  className = '',
  initialYaw,
  modelUrl,
}) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const [model, setModel] = useState({
    status: modelUrl ? 'loading' : 'none',
    progress: 0,
    error: '',
  })

  const modelEvents = {
    onProgress: (progress) =>
      setModel((current) => ({
        ...current,
        progress: progress ?? current.progress,
      })),
    onStatus: (status, detail) =>
      setModel((current) => ({
        ...current,
        status,
        error: status === 'error' ? detail : '',
      })),
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const renderer = createCarRenderer(canvas, {
      body,
      colors: readColors(canvas),
      interactive,
      autoRotate,
      distance,
      initialYaw,
      modelUrl,
      modelEvents,
      onFail: () => setFailed(true),
    })

    rendererRef.current = renderer

    return () => {
      renderer?.destroy()
      rendererRef.current = null
    }
  }, [interactive, autoRotate, distance])

  useEffect(() => {
    rendererRef.current?.setBody(body)
  }, [body])

  const firstModel = useRef(true)

  useEffect(() => {
    if (firstModel.current) {
      firstModel.current = false
      return
    }

    setModel({
      status: modelUrl ? 'loading' : 'none',
      progress: 0,
      error: '',
    })

    rendererRef.current?.setModel(modelUrl || null, modelEvents)
  }, [modelUrl])

  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current?.setColors(readColors(canvasRef.current))
    }
  }, [design])

  if (failed) {
    return (
      <div className={`car3d car3d--fallback ${className}`}>
        <VehicleSilhouette
          body={body}
          title={label}
          className="silhouette--stage"
        />
      </div>
    )
  }

  return (
    <div className={`car3d ${className}`}>
      <canvas
        ref={canvasRef}
        className="car3d-canvas"
        role="img"
        aria-label={
          interactive
            ? `${label}. Interactive 3D preview: drag or use the arrow keys to rotate.`
            : label
        }
        tabIndex={interactive ? 0 : -1}
      />

      {model.status === 'loading' && (
        <div className="car3d-status" role="status">
          <span className="car3d-bar" aria-hidden="true">
            <span
              style={{
                width: `${Math.round((model.progress || 0) * 100)}%`,
              }}
            />
          </span>
          Loading 3D model
          {model.progress
            ? ` · ${Math.round(model.progress * 100)}%`
            : '…'}
        </div>
      )}

      {model.status === 'error' && (
        <div className="car3d-status car3d-status--error" role="status">
          Could not load the exact model, so a stylised shape is shown.
          {' '}{model.error}
        </div>
      )}
    </div>
  )
}
