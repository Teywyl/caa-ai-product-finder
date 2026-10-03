import { useEffect, useRef, useState } from 'react'
import { designs } from '../data/designs.js'
import { useAppState } from '../lib/AppState.jsx'
import { IconCheck, IconChevronDown } from './Icons.jsx'

export function DesignSwitcher() {
  const { design, setDesign } = useAppState()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current =
    designs.find((item) => item.id === design) || designs[0]

  useEffect(() => {
    const onDoc = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="ds" ref={ref}>
      {open && (
        <div
          className="ds-panel"
          role="dialog"
          aria-label="Choose a design"
        >
          <p className="ds-title">Design options</p>
          <div
            role="radiogroup"
            aria-label="Design"
            className="ds-list"
          >
            {designs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === design}
                className={`ds-option${item.id === design ? ' is-on' : ''}`}
                onClick={() => {
                  setDesign(item.id)
                  setOpen(false)
                }}
              >
                <span
                  className="ds-swatch"
                  style={{ background: item.swatch }}
                  aria-hidden="true"
                />
                <span className="ds-text">
                  <span className="ds-name">{item.name}</span>
                  <span className="ds-sum">{item.summary}</span>
                </span>
                {item.id === design && (
                  <IconCheck size={18} className="ds-check" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        className="ds-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="ds-swatch ds-swatch--sm"
          style={{ background: current.swatch }}
          aria-hidden="true"
        />
        <span className="ds-toggle-text">
          <span className="ds-toggle-k">Design</span>
          <span className="ds-toggle-v">{current.name}</span>
        </span>
        <IconChevronDown size={16} />
      </button>
    </div>
  )
}
