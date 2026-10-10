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

// Brand logo paths from Simple Icons: https://github.com/simple-icons/simple-icons
const BRAND_LOGO_PATHS = {
  honda: 'M23.902 6.87c-.33-3.218-2.47-3.895-4.354-4.204-.946-.16-2.63-.3-3.716-.34-.946-.06-3.168-.09-3.835-.09-.657 0-2.89.03-3.835.09-1.076.04-2.77.18-3.716.34C2.563 2.985.42 3.66.092 6.87c-.08.877-.1 2.023-.09 3.248.03 2.031.2 3.406.3 4.363.07.657.338 2.62.687 3.636.478 1.395.916 1.803 1.424 2.222.937.757 2.471.996 2.79 1.056 1.733.31 5.24.368 6.784.368 1.544 0 5.05-.05 6.784-.368.329-.06 1.863-.29 2.79-1.056.508-.419.946-.827 1.424-2.222.35-1.016.628-2.979.698-3.636.1-.957.279-2.332.299-4.363.04-1.225.01-2.371-.08-3.248m-1.176 5.4c-.19 2.57-.418 4.104-.747 5.22-.29.976-.637 1.623-1.165 2.092-.867.787-2.063.956-2.76 1.056-1.514.23-4.055.3-6.057.3-2.002 0-4.543-.08-6.057-.3-.697-.1-1.893-.269-2.76-1.056-.518-.469-.876-1.126-1.155-2.093-.329-1.105-.558-2.65-.747-5.22-.11-1.543-.09-4.054.08-5.4.258-2.011 1.255-3.018 3.387-3.396.996-.18 2.34-.31 3.606-.37 1.016-.07 2.7-.1 3.636-.09.936-.01 2.62.03 3.636.09 1.275.06 2.61.19 3.606.37 2.142.378 3.139 1.395 3.388 3.397.199 1.345.229 3.856.11 5.4m-5.202-8.39c-.548 2.462-.767 3.588-1.216 5.37-.428 1.715-.767 3.298-1.335 4.065-.587.777-1.365.947-1.893 1.006-.279.03-.478.04-1.066.05-.596 0-.796-.02-1.075-.05-.528-.06-1.315-.229-1.892-1.006-.578-.767-.907-2.35-1.335-4.064-.47-1.773-.678-2.91-1.236-5.37 0 0-.548.02-.797.04-.329.02-.588.05-.867.09.343 5.372.692 11.079 1.126 16.13a21.983 21.983 0 002.39.169c.33-1.266.748-3.02 1.207-3.767.378-.608.966-.677 1.295-.717.518-.07.956-.08 1.165-.08.2-.01.637 0 1.165.08.33.05.917.11 1.295.717.47.747.877 2.5 1.206 3.766 0 0 .358-.01 1.165-.05.41-.018.82-.058 1.226-.12.458-5.39.785-10.728 1.126-16.128-.28-.04-.538-.07-.867-.09-.23-.02-.787-.04-.787-.04z',
  nissan: 'M20.576 14.955l-.01.028c-1.247 3.643-4.685 6.086-8.561 6.086-3.876 0-7.32-2.448-8.562-6.09l-.01-.029H.71v.329l1.133.133c.7.08.847.39 1.038.78l.048.096c1.638 3.495 5.204 5.752 9.08 5.752 3.877 0 7.443-2.257 9.081-5.747l.048-.095c.19-.39.338-.7 1.038-.781l1.134-.134v-.328zM3.443 9.012c1.247-3.643 4.686-6.09 8.562-6.09 3.876 0 7.319 2.447 8.562 6.09l.01.028h2.728v-.328l-1.134-.133c-.7-.081-.847-.39-1.038-.781l-.047-.096C19.448 4.217 15.88 1.96 12.005 1.96c-3.881 0-7.443 2.257-9.081 5.752l-.048.095c-.19.39-.338.7-1.038.781l-1.133.133v.329h2.724zm13.862 1.586l-1.743 2.795h.752l.31-.5h2.033l.31.5h.747l-1.743-2.795zm1.033 1.766h-1.395l.7-1.124zm2.81-1.066l2.071 2.095H24v-2.795h-.614v2.085l-2.062-2.085h-.795v2.795h.619zM0 13.393h.619v-2.095l2.076 2.095h.781v-2.795h-.619v2.085L.795 10.598H0zm4.843-2.795h.619v2.795h-.62zm4.486 2.204c-.02.005-.096.005-.124.005H6.743v.572h2.5c.019 0 .167 0 .195-.005.51-.048.743-.472.743-.843 0-.381-.243-.79-.705-.833-.09-.01-.166-.01-.2-.01H7.643a.83.83 0 0 1-.181-.014c-.129-.034-.176-.148-.176-.243 0-.086.047-.2.18-.238a.68.68 0 0 1 .172-.014h2.357v-.562H7.6c-.1 0-.176.004-.238.014a.792.792 0 0 0-.695.805c0 .343.214.743.685.81.086.009.205.009.258.009H9.2c.029 0 .1 0 .114.005.181.023.243.157.243.276a.262.262 0 0 1-.228.266zm4.657 0c-.02.005-.096.005-.129.005H11.4v.572h2.5c.019 0 .167 0 .195-.005.51-.048.743-.472.743-.843 0-.381-.243-.79-.705-.833-.09-.01-.166-.01-.2-.01H12.3a.83.83 0 0 1-.181-.014c-.129-.034-.176-.148-.176-.243 0-.086.047-.2.18-.238a.68.68 0 0 1 .172-.014h2.357v-.562h-2.395c-.1 0-.176.004-.238.014a.792.792 0 0 0-.695.805c0 .343.214.743.686.81.085.009.204.009.257.009h1.59c.029 0 .1 0 .114.005.181.023.243.157.243.276a.267.267 0 0 1-.228.266Z',
  suzuki: 'M17.369 19.995C13.51 22.39 12 24 12 24L.105 15.705s5.003-3.715 9.186-.87l5.61 3.882.683-.453L.106 7.321s2.226-.65 6.524-3.315C10.49 1.609 12 0 12 0l11.895 8.296s-5.003 3.715-9.187.87L9.1 5.281l-.683.454L23.893 16.68s-2.224.649-6.524 3.315Z',
}

export function BrandMark({ brand, size = 'md' }) {
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
      {BRAND_LOGO_PATHS[brand.id] ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          width="66%"
          height="66%"
          focusable="false"
          aria-hidden="true"
        >
          <path d={BRAND_LOGO_PATHS[brand.id]} />
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
