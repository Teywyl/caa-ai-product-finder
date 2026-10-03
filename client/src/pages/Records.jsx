import { useRef, useState } from 'react'
import { useAppState, can } from '../lib/AppState.jsx'
import { CATEGORIES as categories } from '../lib/roles.js'
import { formatYears, vehicleLabel } from '../lib/match.js'
import { paths } from '../lib/router.js'
import { useApi } from '../lib/useApi.js'
import { compatibilityApi, productsApi } from '../api/index.js'
import {
  EmptyState, LoadError, Loading, MARKETPLACES, StatusBadge,
} from '../components/ui.jsx'
import {
  IconEdit, IconPlus, IconShield, IconTrash,
} from '../components/Icons.jsx'

const MARKET_HOSTS = {
  shopee: 'shopee.',
  lazada: 'lazada.',
  tiktok: 'tiktok.',
}
const YEAR_MIN = 1980
const YEAR_MAX = 2100

const emptyProduct = () => ({
  id: '',
  name: '',
  category: categories[0],
  partNumber: '',
  description: '',
  listed: true,
  stock: { status: 'unconfirmed', checkedOn: '' },
  pricePhp: '',
  links: { shopee: '', lazada: '', tiktok: '' },
})

const emptyRecord = (products, models) => ({
  id: '',
  productId: products[0]?.id ?? '',
  modelId: models[0]?.id ?? '',
  yearFrom: '',
  yearTo: '',
  status: 'needs_verification',
  source: '',
})

function validateProduct(product) {
  const errors = {}
  if (!product.name.trim()) errors.name = 'Enter a product name.'
  if (!product.category) errors.category = 'Choose a category.'
  if (product.stock.status !== 'unconfirmed' && !product.stock.checkedOn) {
    errors.checkedOn = 'Add the date stock was checked.'
  }

  const price = String(product.pricePhp ?? '').trim()
  if (price && !/^\d{1,8}(\.\d{1,2})?$/.test(price)) {
    errors.pricePhp = 'Enter an amount like 450 or 450.50, or leave it blank.'
  }

  for (const market of MARKETPLACES) {
    const url = (product.links[market.key] || '').trim()
    if (!url) continue

    let parsed
    try {
      parsed = new URL(url)
    } catch {
      errors[market.key] = 'Enter a full link starting with https://'
      continue
    }

    if (parsed.protocol !== 'https:') {
      errors[market.key] = 'Use an https:// link.'
    } else if (!parsed.hostname.includes(MARKET_HOSTS[market.key])) {
      errors[market.key] = `This does not look like a ${market.name} link.`
    }
  }

  return errors
}

function validateRecord(record) {
  const errors = {}
  if (!record.productId) errors.productId = 'Choose a product.'
  if (!record.modelId) errors.modelId = 'Choose a vehicle.'

  const from = record.yearFrom === '' ? null : Number(record.yearFrom)
  const to = record.yearTo === '' ? null : Number(record.yearTo)
  const bad = (year) =>
    year != null &&
    (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX)

  if (bad(from)) {
    errors.yearFrom = `Enter a year between ${YEAR_MIN} and ${YEAR_MAX}.`
  }
  if (bad(to)) {
    errors.yearTo = `Enter a year between ${YEAR_MIN} and ${YEAR_MAX}.`
  }
  if (from == null && to != null) {
    errors.yearFrom = 'Add the first year, or clear both years.'
  }
  if (from != null && to != null && to < from) {
    errors.yearTo = 'The last year must be the same as or after the first year.'
  }
  if (record.status === 'confirmed' && from == null) {
    errors.yearFrom = 'A confirmed record needs at least a first year.'
  }
  if (record.status === 'confirmed' && !record.source.trim()) {
    errors.source = 'Note where the fit was confirmed, such as the listing title.'
  }

  return errors
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export function NotAuthorized({ navigate, need }) {
  return (
    <EmptyState
      icon={<IconShield size={28} />}
      title="This area needs a different role"
      actions={
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate(paths.home())}
        >
          Back to Home
        </button>
      }
    >
      {need}. Ask an Admin if you need access.
    </EmptyState>
  )
}

export function Records({ navigate }) {
  const { catalog, reloadCatalog, currentUser, notify } = useAppState()
  const [tab, setTab] = useState('products')
  const [draft, setDraft] = useState(null)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [modelFilter, setModelFilter] = useState('all')
  const formRef = useRef(null)
  const allowed = can(currentUser, 'manageRecords')

  const data = useApi(
    async () => {
      if (!allowed) return null
      const [{ products }, { records }] = await Promise.all([
        productsApi.list(),
        compatibilityApi.list(),
      ])
      return { products, records }
    },
    [allowed]
  )

  if (!allowed) {
    return (
      <NotAuthorized
        navigate={navigate}
        need="Product records are for Editor and Admin accounts"
      />
    )
  }
  if (data.status === 'loading' && !data.data) {
    return <Loading>Loading records…</Loading>
  }
  if (data.status === 'error') {
    return (
      <LoadError
        error={data.error}
        title="Could not load the records."
        onRetry={data.reload}
      />
    )
  }

  const { products, records: allRecords } = data.data
  const models = catalog.models

  const openDraft = (value) => {
    setDraft(value)
    setErrors({})
    setServerError('')
    setConfirming(false)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      formRef.current?.querySelector('input, select, textarea')?.focus({
        preventScroll: true,
      })
    }, 30)
  }

  const switchTab = (value) => {
    setTab(value)
    setDraft(null)
    setErrors({})
    setServerError('')
    setConfirming(false)
  }

  const send = async (action, doneText) => {
    setBusy(true)
    setServerError('')

    try {
      await action()
      setDraft(null)
      setConfirming(false)
      notify(doneText)
      data.reload()
      reloadCatalog()
    } catch (error) {
      setServerError(error.message)
      setConfirming(false)
    } finally {
      setBusy(false)
    }
  }

  const saveProduct = (event) => {
    event.preventDefault()
    const foundErrors = validateProduct(draft)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length) return

    const body = {
      name: draft.name.trim(),
      category: draft.category,
      partNumber: draft.partNumber.trim(),
      description: draft.description.trim(),
      listed: draft.listed,
      stock: draft.stock.status === 'unconfirmed'
        ? { status: 'unconfirmed' }
        : draft.stock,
      pricePhp: String(draft.pricePhp ?? '').trim() === ''
        ? null
        : Number(draft.pricePhp),
      links: Object.fromEntries(
        MARKETPLACES.map((market) => [
          market.key,
          (draft.links[market.key] || '').trim() || null,
        ])
      ),
    }

    const isNew = !draft.id
    send(
      () => isNew
        ? productsApi.create(body)
        : productsApi.update(draft.id, body),
      isNew ? `Added “${body.name}”.` : `Saved “${body.name}”.`
    )
  }

  const deleteProduct = () => {
    const removed = allRecords.filter(
      (record) => record.productId === draft.id
    ).length

    send(
      () => productsApi.remove(draft.id),
      `Deleted “${draft.name}”${
        removed
          ? ` and ${removed} compatibility ${removed === 1 ? 'record' : 'records'}`
          : ''
      }.`
    )
  }

  const saveRecord = (event) => {
    event.preventDefault()
    const foundErrors = validateRecord(draft)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length) return

    const body = {
      productId: Number(draft.productId),
      modelId: draft.modelId,
      yearFrom: draft.yearFrom === '' ? null : Number(draft.yearFrom),
      yearTo: draft.yearTo === '' ? null : Number(draft.yearTo),
      status: draft.status,
      source: draft.source.trim(),
    }

    const isNew = !draft.id
    send(
      () => isNew
        ? compatibilityApi.create(body)
        : compatibilityApi.update(draft.id, body),
      isNew ? 'Added compatibility record.' : 'Saved compatibility record.'
    )
  }

  const deleteRecord = () =>
    send(
      () => compatibilityApi.remove(draft.id),
      'Deleted compatibility record.'
    )

  const records = allRecords.filter(
    (record) => modelFilter === 'all' || record.modelId === modelFilter
  )
  const editingProduct = tab === 'products' && draft
  const editingRecord = tab === 'compat' && draft
  const set = (patch) => setDraft((current) => ({ ...current, ...patch }))
  const errId = (key, id) => errors[key] ? `${id}-error` : undefined
  const fitCount = (productId) =>
    allRecords.filter((record) => record.productId === productId).length

  return (
    <div className="stack-lg">
      <div className="page-head page-head--row">
        <div>
          <p className="eyebrow">Authorized account area</p>
          <h1 className="page-title">Product records</h1>
          <p className="muted">
            Add, edit and delete catalogue items, their shop links,
            and the vehicles they fit.
          </p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Record type">
        <button
          type="button"
          role="tab"
          id="tab-products"
          aria-selected={tab === 'products'}
          aria-controls="panel-records"
          className="tab"
          onClick={() => switchTab('products')}
        >
          Products <span className="tab-count">{products.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-compat"
          aria-selected={tab === 'compat'}
          aria-controls="panel-records"
          className="tab"
          onClick={() => switchTab('compat')}
        >
          Compatibility <span className="tab-count">{allRecords.length}</span>
        </button>
      </div>

      <div
        className="records"
        id="panel-records"
        role="tabpanel"
        aria-labelledby={tab === 'products' ? 'tab-products' : 'tab-compat'}
      >
        <div className="records-list">
          <div className="list-toolbar">
            {tab === 'products' ? (
              <p className="muted small">{products.length} products</p>
            ) : (
              <div className="field field--inline">
                <label className="field-label" htmlFor="compat-filter">Vehicle</label>
                <select
                  id="compat-filter"
                  className="input select"
                  value={modelFilter}
                  onChange={(event) => setModelFilter(event.target.value)}
                >
                  <option value="all">All vehicles</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {vehicleLabel(model)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => openDraft(
                tab === 'products'
                  ? emptyProduct()
                  : {
                      ...emptyRecord(products, models),
                      ...(modelFilter !== 'all' ? { modelId: modelFilter } : {}),
                    }
              )}
            >
              <IconPlus size={16} />
              {tab === 'products' ? 'Add item' : 'Add record'}
            </button>
          </div>

          {tab === 'products' && (
            <ul className="rec-list">
              {products.length === 0 && (
                <li>
                  <EmptyState title="No products yet">
                    Add the first catalogue item.
                  </EmptyState>
                </li>
              )}
              {products.map((product) => {
                const count = fitCount(product.id)
                const shops = MARKETPLACES
                  .filter((market) => product.links?.[market.key])
                  .map((market) => market.name)

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      className={`rec-row${draft?.id === product.id ? ' is-selected' : ''}`}
                      onClick={() => openDraft({
                        ...emptyProduct(),
                        ...product,
                        partNumber: product.partNumber || '',
                        stock: {
                          status: product.stock.status,
                          checkedOn: product.stock.checkedOn || '',
                        },
                        pricePhp: product.pricePhp ?? '',
                        links: {
                          shopee: product.links?.shopee || '',
                          lazada: product.links?.lazada || '',
                          tiktok: product.links?.tiktok || '',
                        },
                      })}
                    >
                      <span className="rec-main">
                        <span className="rec-title">{product.name}</span>
                        <span className="muted small">
                          {product.category}
                          {product.partNumber ? ` · ${product.partNumber}` : ''}
                        </span>
                      </span>
                      <span className="rec-meta small">
                        <span>{shops.length ? shops.join(', ') : 'No shop links'}</span>
                        <span className="muted">
                          {count} {count === 1 ? 'fit record' : 'fit records'}
                          {' '}· {product.listed ? 'Listed' : 'Not listed'}
                        </span>
                      </span>
                      <IconEdit size={18} className="rec-edit" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {tab === 'compat' && (
            <ul className="rec-list">
              {records.length === 0 && (
                <li>
                  <EmptyState title="No compatibility records for this vehicle">
                    Add a record to link a product to it.
                  </EmptyState>
                </li>
              )}
              {records.map((record) => (
                <li key={record.id}>
                  <button
                    type="button"
                    className={`rec-row${draft?.id === record.id ? ' is-selected' : ''}`}
                    onClick={() => openDraft({
                      id: record.id,
                      productId: record.productId,
                      modelId: record.modelId,
                      status: record.status,
                      source: record.source || '',
                      yearFrom: record.yearFrom ?? '',
                      yearTo: record.yearTo ?? '',
                    })}
                  >
                    <span className="rec-main">
                      <span className="rec-title">{record.productName}</span>
                      <span className="muted small">
                        {record.vehicle} · <span className="num">{formatYears(record)}</span>
                      </span>
                    </span>
                    <span className="rec-meta">
                      <StatusBadge status={record.status} />
                    </span>
                    <IconEdit size={18} className="rec-edit" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="records-form" ref={formRef}>
          {!draft && (
            <div className="form-placeholder">
              <p className="section-title section-title--sm">
                {tab === 'products' ? 'Edit a product' : 'Edit compatibility'}
              </p>
              <p className="muted small">
                {tab === 'products'
                  ? 'Select a product to edit its details and shop links, or add a new item.'
                  : 'Select a record to change its years or status. Only confirmed records appear in search results.'}
              </p>
            </div>
          )}

          {editingProduct && (
            <form
              className="form panel"
              onSubmit={saveProduct}
              noValidate
              aria-labelledby="pform-title"
            >
              <h2 id="pform-title" className="section-title section-title--sm">
                {draft.id ? 'Edit product' : 'Add item'}
              </h2>
              <Field id="p-name" label="Product name" error={errors.name}>
                <input
                  id="p-name"
                  className="input"
                  value={draft.name}
                  onChange={(event) => set({ name: event.target.value })}
                  aria-invalid={!!errors.name}
                  aria-describedby={errId('name', 'p-name')}
                />
              </Field>
              <div className="form-2">
                <Field id="p-category" label="Category" error={errors.category}>
                  <select
                    id="p-category"
                    className="input select"
                    value={draft.category}
                    onChange={(event) => set({ category: event.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </Field>
                <Field id="p-pn" label="Part number (optional)">
                  <input
                    id="p-pn"
                    className="input"
                    value={draft.partNumber}
                    onChange={(event) => set({ partNumber: event.target.value })}
                  />
                </Field>
              </div>
              <Field
                id="p-desc"
                label="Description"
                hint="Describe only what the listing states."
              >
                <textarea
                  id="p-desc"
                  className="input textarea"
                  rows={3}
                  value={draft.description}
                  onChange={(event) => set({ description: event.target.value })}
                />
              </Field>

              <fieldset className="fieldset">
                <legend className="field-label">Availability</legend>
                <label className="check">
                  <input
                    id="p-listed"
                    type="checkbox"
                    checked={draft.listed}
                    onChange={(event) => set({ listed: event.target.checked })}
                  />
                  <span>
                    Listed in CAA catalogue
                    (shown in results when a confirmed fit exists)
                  </span>
                </label>
                <div className="form-2">
                  <Field id="p-stock" label="Stock">
                    <select
                      id="p-stock"
                      className="input select"
                      value={draft.stock.status}
                      onChange={(event) => set({
                        stock: { ...draft.stock, status: event.target.value },
                      })}
                    >
                      <option value="unconfirmed">Not confirmed</option>
                      <option value="in_stock">In stock</option>
                      <option value="out_of_stock">Out of stock</option>
                    </select>
                  </Field>
                  {draft.stock.status !== 'unconfirmed' && (
                    <Field id="p-checked" label="Checked on" error={errors.checkedOn}>
                      <input
                        id="p-checked"
                        type="date"
                        className="input"
                        value={draft.stock.checkedOn}
                        onChange={(event) => set({
                          stock: { ...draft.stock, checkedOn: event.target.value },
                        })}
                        aria-invalid={!!errors.checkedOn}
                      />
                    </Field>
                  )}
                </div>
                <Field
                  id="p-price"
                  label="Recorded price in ₱ (optional)"
                  error={errors.pricePhp}
                  hint="Leave blank unless you have checked it. The marketplace price is the current one."
                >
                  <input
                    id="p-price"
                    className="input num"
                    inputMode="decimal"
                    placeholder="Not recorded"
                    value={draft.pricePhp}
                    onChange={(event) => set({ pricePhp: event.target.value })}
                    aria-invalid={!!errors.pricePhp}
                    aria-describedby={errId('pricePhp', 'p-price')}
                  />
                </Field>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="field-label">Shop links</legend>
                <p className="field-hint">
                  Paste the exact listing URL. Leave blank when the item
                  is not on that marketplace.
                </p>
                {MARKETPLACES.map((market) => (
                  <Field
                    key={market.key}
                    id={`p-${market.key}`}
                    label={market.name}
                    error={errors[market.key]}
                  >
                    <input
                      id={`p-${market.key}`}
                      className="input input--mono"
                      inputMode="url"
                      placeholder="Unavailable"
                      value={draft.links[market.key] || ''}
                      onChange={(event) => set({
                        links: {
                          ...draft.links,
                          [market.key]: event.target.value,
                        },
                      })}
                      aria-invalid={!!errors[market.key]}
                      aria-describedby={errId(market.key, `p-${market.key}`)}
                    />
                  </Field>
                ))}
              </fieldset>

              {draft.id && (
                <p className="muted small">
                  {fitCount(draft.id)} compatibility records use this product.
                  {' '}
                  <button
                    type="button"
                    className="link-btn link-btn--inline"
                    onClick={() => switchTab('compat')}
                  >
                    Edit compatibility
                  </button>
                </p>
              )}
              {Object.keys(errors).length > 0 && (
                <p className="field-error" role="alert">
                  Fix the highlighted fields, then save.
                </p>
              )}
              {serverError && (
                <p className="field-error" role="alert">{serverError}</p>
              )}
              <FormActions
                isNew={!draft.id}
                confirming={confirming}
                setConfirming={setConfirming}
                onCancel={() => setDraft(null)}
                onDelete={deleteProduct}
                deleteText={`Delete this product${
                  fitCount(draft.id) ? ' and its compatibility records' : ''
                }?`}
                busy={busy}
              />
            </form>
          )}

          {editingRecord && (
            <form
              className="form panel"
              onSubmit={saveRecord}
              noValidate
              aria-labelledby="cform-title"
            >
              <h2 id="cform-title" className="section-title section-title--sm">
                {draft.id ? 'Edit compatibility' : 'Add compatibility record'}
              </h2>
              <Field id="c-product" label="Product" error={errors.productId}>
                <select
                  id="c-product"
                  className="input select"
                  value={draft.productId}
                  onChange={(event) => set({ productId: Number(event.target.value) })}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.category})
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="c-model" label="Vehicle" error={errors.modelId}>
                <select
                  id="c-model"
                  className="input select"
                  value={draft.modelId}
                  onChange={(event) => set({ modelId: event.target.value })}
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {vehicleLabel(model)}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="form-2">
                <Field id="c-from" label="First year" error={errors.yearFrom}>
                  <input
                    id="c-from"
                    className="input num"
                    inputMode="numeric"
                    placeholder="e.g. 2018"
                    value={draft.yearFrom}
                    onChange={(event) => set({
                      yearFrom: event.target.value.replace(/\D/g, '').slice(0, 4),
                    })}
                    aria-invalid={!!errors.yearFrom}
                    aria-describedby={errId('yearFrom', 'c-from')}
                  />
                </Field>
                <Field
                  id="c-to"
                  label="Last year"
                  error={errors.yearTo}
                  hint="Leave blank for “onward”."
                >
                  <input
                    id="c-to"
                    className="input num"
                    inputMode="numeric"
                    placeholder="Onward"
                    value={draft.yearTo}
                    onChange={(event) => set({
                      yearTo: event.target.value.replace(/\D/g, '').slice(0, 4),
                    })}
                    aria-invalid={!!errors.yearTo}
                    aria-describedby={errId('yearTo', 'c-to')}
                  />
                </Field>
              </div>
              <fieldset className="fieldset">
                <legend className="field-label">Status</legend>
                <div className="radio-row">
                  <label className="check">
                    <input
                      type="radio"
                      name="c-status"
                      id="c-status-confirmed"
                      checked={draft.status === 'confirmed'}
                      onChange={() => set({ status: 'confirmed' })}
                    />
                    <span>Confirmed (shown in results)</span>
                  </label>
                  <label className="check">
                    <input
                      type="radio"
                      name="c-status"
                      id="c-status-verify"
                      checked={draft.status === 'needs_verification'}
                      onChange={() => set({ status: 'needs_verification' })}
                    />
                    <span>Needs verification (hidden from results)</span>
                  </label>
                </div>
              </fieldset>
              <Field
                id="c-source"
                label="Source or note"
                error={errors.source}
                hint="For example, the listing title that states the years."
              >
                <textarea
                  id="c-source"
                  className="input textarea"
                  rows={3}
                  value={draft.source}
                  onChange={(event) => set({ source: event.target.value })}
                  aria-invalid={!!errors.source}
                  aria-describedby={errId('source', 'c-source')}
                />
              </Field>
              {Object.keys(errors).length > 0 && (
                <p className="field-error" role="alert">
                  Fix the highlighted fields, then save.
                </p>
              )}
              {serverError && (
                <p className="field-error" role="alert">{serverError}</p>
              )}
              <FormActions
                isNew={!draft.id}
                confirming={confirming}
                setConfirming={setConfirming}
                onCancel={() => setDraft(null)}
                onDelete={deleteRecord}
                deleteText="Delete this compatibility record?"
                busy={busy}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function FormActions({
  isNew,
  confirming,
  setConfirming,
  onCancel,
  onDelete,
  deleteText,
  busy = false,
}) {
  if (confirming) {
    return (
      <div
        className="form-actions confirm-inline"
        role="group"
        aria-label="Confirm delete"
      >
        <span className="small">{deleteText}</span>
        <button
          type="button"
          className="btn btn--danger"
          onClick={onDelete}
          disabled={busy}
        >
          <IconTrash size={16} /> Delete
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setConfirming(false)}
        >
          Keep
        </button>
      </div>
    )
  }

  return (
    <div className="form-actions">
      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? 'Saving…' : 'Save'}
      </button>
      <button type="button" className="btn btn--ghost" onClick={onCancel}>
        Cancel
      </button>
      {!isNew && (
        <button
          type="button"
          className="btn btn--danger-ghost form-actions-end"
          onClick={() => setConfirming(true)}
        >
          <IconTrash size={16} /> Delete
        </button>
      )}
    </div>
  )
}
