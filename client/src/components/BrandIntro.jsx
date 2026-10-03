import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { BrandMark } from './ui.jsx'

const BrandIntroContext = createContext({
  play: (_brand, _rect, done) => done(),
})

export const useBrandIntro = () => useContext(BrandIntroContext)

const reduceMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const FLY = 900
const HOLD = 700
const OUT = 520

export function BrandIntroProvider({ children }) {
  const [run, setRun] = useState(null)

  const play = useCallback((brand, rect, onArrive) => {
    if (!rect || reduceMotion()) {
      onArrive()
      return
    }

    setRun({ brand, rect, onArrive, key: Date.now() })
  }, [])

  return (
    <BrandIntroContext.Provider value={{ play }}>
      {children}
      {run && (
        <BrandIntroOverlay
          key={run.key}
          run={run}
          onEnd={() => setRun(null)}
        />
      )}
    </BrandIntroContext.Provider>
  )
}

function BrandIntroOverlay({ run, onEnd }) {
  const root = useRef(null)
  const mark = useRef(null)
  const title = useRef(null)
  const backdrop = useRef(null)
  const ring = useRef(null)
  const arrived = useRef(false)
  const timers = useRef([])
  const anims = useRef([])

  const arrive = useCallback(() => {
    if (arrived.current) return
    arrived.current = true
    run.onArrive()
  }, [run])

  const finish = useCallback(() => {
    arrive()

    const animation = root.current?.animate?.(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: OUT, easing: 'ease', fill: 'forwards' }
    )

    if (animation) animation.onfinish = onEnd
    else onEnd()
  }, [arrive, onEnd])

  const skip = useCallback(() => {
    timers.current.forEach(clearTimeout)
    anims.current.forEach((animation) => animation.finish?.())
    finish()
  }, [finish])

  useLayoutEffect(() => {
    const element = mark.current

    if (!element || !element.animate) {
      finish()
      return undefined
    }

    const to = element.getBoundingClientRect()
    const from = run.rect
    const dx =
      from.left + from.width / 2 - (to.left + to.width / 2)
    const dy =
      from.top + from.height / 2 - (to.top + to.height / 2)
    const scale = from.width / to.width
    const ease = 'cubic-bezier(0.22, 0.8, 0.16, 1)'

    anims.current = [
      backdrop.current.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: FLY * 0.7,
          easing: 'ease-out',
          fill: 'both',
        }
      ),
      element.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
            filter: 'drop-shadow(0 0 0 rgba(0,183,181,0))',
          },
          {
            transform: 'translate(0, 0) scale(1)',
            filter: 'drop-shadow(0 0 40px rgba(0,183,181,0.55))',
          },
        ],
        { duration: FLY, easing: ease, fill: 'both' }
      ),
      ring.current.animate(
        [
          {
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.6)',
          },
          {
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.6)',
            offset: 0.55,
          },
          {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
            offset: 0.8,
          },
          {
            opacity: 0.85,
            transform: 'translate(-50%, -50%) scale(1.06)',
          },
        ],
        {
          duration: FLY + HOLD,
          easing: 'ease-out',
          fill: 'both',
        }
      ),
      title.current.animate(
        [
          {
            opacity: 0,
            transform: 'translateY(14px)',
            letterSpacing: '0.6em',
          },
          {
            opacity: 0,
            transform: 'translateY(14px)',
            letterSpacing: '0.6em',
            offset: 0.5,
          },
          {
            opacity: 1,
            transform: 'translateY(0)',
            letterSpacing: '0.32em',
          },
        ],
        {
          duration: FLY + 300,
          easing: 'ease-out',
          fill: 'both',
        }
      ),
    ]

    timers.current.push(setTimeout(finish, FLY + HOLD))
    const activeTimers = timers.current
    return () => activeTimers.forEach(clearTimeout)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-intro')
    return () =>
      document.documentElement.classList.remove('is-intro')
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') skip()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [skip])

  const count = run.brand.modelCount ?? 0

  return (
    <div
      className="bi"
      ref={root}
      onClick={skip}
      role="status"
      aria-live="polite"
    >
      <div className="bi-backdrop" ref={backdrop} />
      <div className="bi-ring" ref={ring} aria-hidden="true" />
      <div className="bi-stage">
        <div className="bi-mark" ref={mark}>
          <BrandMark brand={run.brand} size="hero" />
        </div>
        <div className="bi-title" ref={title}>
          <span className="bi-name">{run.brand.name}</span>
          <span className="bi-sub">
            {count} {count === 1 ? 'model' : 'models'} in the garage
          </span>
        </div>
      </div>
      <span className="sr-only">
        Opening {run.brand.name} models
      </span>
    </div>
  )
}
