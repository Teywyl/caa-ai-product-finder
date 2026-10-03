import { useEffect, useId, useRef, useState } from 'react'
import { IconSearch, IconSpark } from './Icons.jsx'
import { searchVehicles, modelLabel } from '../lib/match.js'
import { paths } from '../lib/router.js'
import { useAppState } from '../lib/AppState.jsx'

export function QuickSearch({
  navigate,
  id = 'quick-search',
  autoFocus = false,
  onDone,
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()
  const wrap = useRef(null)

  const { catalog } = useAppState()
  const results = searchVehicles(catalog, q)

  const options = [
    ...results.map((result) =>
      result.type === 'brand'
        ? {
            key: `b-${result.id}`,
            label: result.brand.name,
            meta: 'Brand',
            to: paths.brand(result.id),
          }
        : {
            key: `m-${result.id}`,
            label: `${result.brand.name} ${modelLabel(result.model)}`,
            meta: 'Model',
            to: paths.vehicle(result.id),
          }
    ),
    ...(q.trim()
      ? [{
          key: 'ai',
          label: `Ask AI Finder: “${q.trim()}”`,
          meta: 'Finder',
          to: paths.ai(q.trim()),
          ai: true,
        }]
      : []),
  ]

  useEffect(() => {
    const onDoc = (event) => {
      if (wrap.current && !wrap.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onDoc)
    return () =>
      document.removeEventListener('pointerdown', onDoc)
  }, [])

  useEffect(() => setActive(0), [q])

  const go = (option) => {
    if (!option) return
    navigate(option.to)
    setQ('')
    setOpen(false)
    onDone?.()
  }

  const onKey = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((index) =>
        Math.max(0, Math.min(index + 1, options.length - 1))
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(options[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const expanded = open && q.trim().length > 0

  return (
    <div className="qs" ref={wrap}>
      <label htmlFor={id} className="sr-only">
        Quick search for a brand or model
      </label>
      <IconSearch size={18} className="qs-icon" />
      <input
        id={id}
        className="qs-input"
        type="search"
        placeholder="Search brand or model, e.g. Terra"
        autoComplete="off"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          expanded && options[active]
            ? `${listId}-${options[active].key}`
            : undefined
        }
        value={q}
        autoFocus={autoFocus}
        onChange={(event) => {
          setQ(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
      />
      {expanded && (
        <ul
          className="qs-list"
          id={listId}
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 && (
            <li className="qs-empty" role="presentation">
              No brand or model matches “{q.trim()}”.
            </li>
          )}
          {options.map((option, index) => (
            <li
              key={option.key}
              id={`${listId}-${option.key}`}
              role="option"
              aria-selected={index === active}
              className={`qs-option${index === active ? ' is-active' : ''}${option.ai ? ' is-ai' : ''}`}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => go(option)}
              onMouseEnter={() => setActive(index)}
            >
              {option.ai && <IconSpark size={16} />}
              <span className="qs-label">{option.label}</span>
              <span className="qs-meta">{option.meta}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
