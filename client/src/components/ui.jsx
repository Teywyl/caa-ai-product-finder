import hondaLogo from '../assets/brands/honda.png'
import nissanLogo from '../assets/brands/nissan-transparent.png'
import suzukiLogo from '../assets/brands/suzuki.png'
import {
  CategoryArt,
  IconAlert,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconExternal,
  IconInfo,
} from './Icons.jsx'
import { VehicleSilhouette } from './VehicleVisual.jsx'
import { formatYears } from '../lib/match.js'

export const MARKETPLACES = [
  { key: 'lazada', name: 'Lazada' },
  { key: 'shopee', name: 'Shopee' },
  { key: 'tiktok', name: 'TikTok' },
]

export function BackLink({ onClick, children, light = false }) {
  return (
    <button
      type="button"
      className={`back-link${light ? ' back-link--light' : ''}`}
      onClick={onClick}
    >
      <IconChevronLeft size={18} />
      {children}
    </button>
  )
}

export function Notice({ tone = 'info', title, children, action }) {
  const Icon =
    tone === 'warn' || tone === 'error' ? IconAlert : IconInfo

  return (
    <div
      className={`notice notice--${tone}`}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <Icon size={18} className="notice-icon" />
      <div className="notice-body">
        {title && <strong className="notice-title">{title}</strong>}
        {children && <div>{children}</div>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, children, actions }) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3 className="empty-title">{title}</h3>
      {children && <div className="empty-text">{children}</div>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  )
}

export function StatusBadge({ status }) {
  if (status === 'confirmed') {
    return (
      <span className="badge badge--confirmed">
        <IconCheck size={14} /> Confirmed
      </span>
    )
  }

  return (
    <span className="badge badge--verify">
      <IconAlert size={14} /> Needs verification
    </span>
  )
}

export function stockText(stock) {
  if (stock?.status === 'in_stock') {
    return `In stock${stock.checkedOn ? ` (checked ${stock.checkedOn})` : ''}`
  }

  if (stock?.status === 'out_of_stock') {
    return `Out of stock${stock.checkedOn ? ` (checked ${stock.checkedOn})` : ''}`
  }

  return 'Stock not confirmed'
}

export function AvailabilityLine({ product, compact = false }) {
  return (
    <div className={`avail${compact ? ' avail--compact' : ''}`}>
      <span className="avail-item">
        <span
          className={`dot ${product.listed ? 'dot--on' : ''}`}
          aria-hidden="true"
        />
        {product.listed ? 'Listed in CAA catalogue' : 'Not listed'}
      </span>
      <span className="avail-item avail-item--muted">
        {stockText(product.stock)}
      </span>
    </div>
  )
}

// Frame the emblem itself, excluding each PNG's empty outer margins.
const BRAND_LOGOS = {
  honda: { src: hondaLogo, width: 2126, height: 806, viewBox: '628 31 920 750', size: '78%' },
  nissan: { src: nissanLogo, width: 1438, height: 1093, viewBox: '198 88 1032 894', size: '66%' },
  suzuki: { src: suzukiLogo, width: 3840, height: 2160, viewBox: '933 15 1985 2118', size: '78%' },
}

export function BrandMark({ brand, size = 'md' }) {
  const logo = BRAND_LOGOS[brand.id]
  if (brand.logoUrl) {
    return (
      <span className={`brand-mark brand-mark--${size} brand-mark--img`}>
        <img src={brand.logoUrl} alt="" />
      </span>
    )
  }

  return (
    <span
      className={`brand-mark brand-mark--${size}`}
      aria-hidden="true"
    >
      {logo ? (
        <svg
          viewBox={logo.viewBox}
          width={logo.size}
          height={logo.size}
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
          aria-hidden="true"
        >
          <image href={logo.src} width={logo.width} height={logo.height} />
        </svg>
      ) : brand.name.slice(0, 1)}
    </span>
  )
}

export function BrandCard({ brand, models, onSelect, selected }) {
  return (
    <button
      type="button"
      className={`brand-card spot${selected ? ' is-selected' : ''}`}
      onClick={(e) =>
        onSelect(
          e,
          e.currentTarget.querySelector('.brand-mark')?.getBoundingClientRect()
        )
      }
      aria-label={`${brand.name}, ${models.length} models`}
    >
      <span className="brand-card-top">
        <BrandMark brand={brand} size="lg" />
      </span>
      <span className="brand-name">{brand.name}</span>
      <span className="brand-models">
        {models.map((m) => m.name).join(' · ')}
      </span>
      <span className="brand-foot">
        Explore {models.length} {models.length === 1 ? 'model' : 'models'}
        <IconChevronRight size={18} />
      </span>
    </button>
  )
}

export function ModelCard({ model, count, onSelect }) {
  return (
    <button type="button" className="model-card spot" onClick={onSelect}>
      <span className="model-art">
        <VehicleSilhouette body={model.body} />
      </span>
      <span className="model-info">
        <span className="model-name">{model.name}</span>
        <span className="model-variant">{model.variant || '\u00a0'}</span>
        <span className="model-meta">
          <span
            className={`dot ${count > 0 ? 'dot--on' : ''}`}
            aria-hidden="true"
          />
          {count > 0
            ? `${count} ${count === 1 ? 'product' : 'products'} recorded`
            : 'No products yet'}
        </span>
      </span>
      <IconChevronRight size={18} className="model-chev" />
    </button>
  )
}

const LOCKED_BODIES = [
  'sedan', 'suv', 'hatch', 'pickup', 'mpv', 'mini', 'offroad',
]

export function GarageSlot({ model, count, index, total, onSelect }) {
  return (
    <button
      type="button"
      className="slot slot--open spot"
      style={{ '--i': index }}
      onClick={onSelect}
    >
      <span className="slot-no num">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="slot-badge">Available</span>
      <span className="slot-art">
        <VehicleSilhouette body={model.body} />
      </span>
      <span className="slot-info">
        <span className="model-name">{model.name}</span>
        <span className="model-variant">{model.variant || '\u00a0'}</span>
        <span className="slot-meta">
          <span
            className={`dot ${count > 0 ? 'dot--on' : ''}`}
            aria-hidden="true"
          />
          {count > 0
            ? `${count} ${count === 1 ? 'part' : 'parts'} on record`
            : 'No parts yet'}
        </span>
      </span>
      <span className="slot-go" aria-hidden="true">
        <IconChevronRight size={18} />
      </span>
      <span className="sr-only">
        , slot {index + 1} of {total}
      </span>
    </button>
  )
}

export function LockedSlot({ index, total }) {
  return (
    <div
      className="slot slot--locked"
      style={{ '--i': index }}
      role="img"
      aria-label={`Slot ${index + 1} of ${total}: locked, no model added yet`}
    >
      <span className="slot-no num">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="slot-art">
        <VehicleSilhouette
          body={LOCKED_BODIES[index % LOCKED_BODIES.length]}
          className="silhouette--locked"
        />
        <span className="slot-lock" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
        </span>
      </span>
      <span className="slot-info">
        <span className="slot-locked-title">Locked</span>
        <span className="slot-meta">Not in the catalogue yet</span>
      </span>
    </div>
  )
}

export function PartCard({ product, record, onOpen }) {
  const links = MARKETPLACES
    .filter((market) => product.links?.[market.key])
    .map((market) => market.name)

  return (
    <article className="part-card spot">
      <div className="part-art" aria-hidden="true">
        <CategoryArt category={product.category} size={76} />
      </div>
      <div className="part-body">
        {product.category !== product.name && (
          <p className="eyebrow">{product.category}</p>
        )}
        <h3 className="part-name">{product.name}</h3>
        {product.partNumber && (
          <p className="part-pn">Part no. {product.partNumber}</p>
        )}
        {record && (
          <p className="part-fit">Recorded fit: {formatYears(record)}</p>
        )}
        <AvailabilityLine product={product} compact />
        <p className="part-shops">
          {links.length ? `On ${links.join(', ')}` : 'No shop links yet'}
        </p>
      </div>
      <button
        type="button"
        className="btn btn--primary btn--block part-cta"
        onClick={onOpen}
      >
        View details
        <span className="sr-only">for {product.name}</span>
        <IconChevronRight size={18} />
      </button>
    </article>
  )
}

export function YearSelect({
  model,
  years,
  value,
  onChange,
  id = 'year-select',
  dark = true,
}) {
  return (
    <div className={`year-select${dark ? ' year-select--dark' : ''}`}>
      <label className="year-select-label" htmlFor={id}>
        Model year
      </label>
      <select
        id={id}
        className="year-select-input num"
        value={value ?? ''}
        onChange={(e) =>
          e.target.value && onChange(Number(e.target.value))
        }
      >
        {value == null && <option value="">Select year</option>}
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <span className="sr-only">for {model.name}</span>
    </div>
  )
}

export function MarketTile({ market, url }) {
  if (!url) {
    return (
      <div className="market market--off">
        <span className="market-name">{market.name}</span>
        <span className="market-off">Unavailable</span>
      </div>
    )
  }

  return (
    <a
      className="market market--on"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="market-name">{market.name}</span>
      <span className="market-cta">
        View on {market.name}
        <IconExternal size={18} />
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

export function Spinner({ label = 'Loading' }) {
  return (
    <span className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function Loading({ children = 'Loading…' }) {
  return (
    <div className="loading-row" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function LoadError({
  error,
  title = 'Could not load this.',
  onRetry,
}) {
  const notBuilt = error?.status === 501

  return (
    <Notice
      tone={notBuilt ? 'info' : 'error'}
      title={notBuilt ? 'Not available yet.' : title}
      action={
        onRetry && !notBuilt ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onRetry}
          >
            Try again
          </button>
        ) : null
      }
    >
      {error?.message || 'Something went wrong.'}
    </Notice>
  )
}
