import { useEffect } from 'react'
import { useAppState, can } from '../lib/AppState.jsx'
import {
  formatYears, getBrand, getModel, isYearSelectable,
  modelLabel, vehicleLabel, yearOptions,
} from '../lib/match.js'
import { paths } from '../lib/router.js'
import { useApi } from '../lib/useApi.js'
import { catalogApi } from '../api/index.js'
import { VehicleStage } from '../components/VehicleVisual.jsx'
import {
  BackLink, BrandMark, EmptyState, LoadError,
  Loading, Notice, PartCard, YearSelect,
} from '../components/ui.jsx'
import { IconCar } from '../components/Icons.jsx'

export function Vehicle({ modelId, query, navigate }) {
  const { catalog, currentUser, rememberVehicle } = useAppState()
  const model = getModel(catalog, modelId)
  const requested = query.year ? Number(query.year) : null
  const year = model && isYearSelectable(model, requested) ? requested : null
  const badYear = requested != null && year == null
  const closedName = query.closedName || null

  const results = useApi(
    (signal) =>
      model && year
        ? catalogApi.compatibleProducts(model.id, year, { signal })
        : null,
    [model?.id, year]
  )

  const pendingRes = useApi(
    (signal) => model ? catalogApi.pending(model.id, { signal }) : null,
    [model?.id]
  )

  useEffect(() => {
    if (model) rememberVehicle(model.id, year)
  }, [model?.id, year])

  if (!model) {
    return (
      <EmptyState
        title="That vehicle is not in the catalogue"
        actions={
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate(paths.home())}
          >
            Choose vehicle
          </button>
        }
      >
        It may have been removed or the link is incomplete.
      </EmptyState>
    )
  }

  const brand = getBrand(catalog, model.brandId)
  const matches = results.data?.matches ?? []
  const resultsReady = year && results.status === 'ok' && results.data
  const pending = pendingRes.data?.pending ?? []
  const anyConfirmed = model.confirmedProductCount
  const name = vehicleLabel(model)

  const setYear = (value) => navigate(paths.vehicle(model.id, value))
  const focusYear = () => {
    const element = document.getElementById('vehicle-year')
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element?.focus({ preventScroll: true })
  }

  return (
    <div className="stack-lg">
      <BackLink onClick={() => navigate(paths.brand(brand.id))}>
        {brand.name} models
      </BackLink>

      <VehicleStage
        model={model}
        word={model.name}
        brandSlot={
          <span className="stage-brand">
            <BrandMark brand={brand} size="sm" />
            {brand.name}
          </span>
        }
      >
        <h1 id="vehicle-title" className="stage-title">
          {brand.name} {model.name}
          {model.variant && <span className="stage-variant"> {model.variant}</span>}
        </h1>
        <YearSelect
          model={model}
          years={yearOptions(model)}
          value={year}
          onChange={setYear}
          id="vehicle-year"
        />
        <p className="stage-hint" aria-live="polite">
          {year ? (
            <>
              Showing compatible aircon parts for <strong className="num">{year}</strong>
            </>
          ) : 'Select the model year to see compatible parts.'}
        </p>
        <div className="stage-actions">
          <button
            type="button"
            className="link-btn link-btn--light"
            onClick={() => navigate(paths.brand(brand.id))}
          >
            Change model
          </button>
          <span className="stage-dot" aria-hidden="true" />
          <button
            type="button"
            className="link-btn link-btn--light"
            onClick={() => navigate(paths.home())}
          >
            Change brand
          </button>
        </div>
      </VehicleStage>

      {badYear && (
        <Notice
          tone="warn"
          title={`${requested} is not in the year list for the ${modelLabel(model)}.`}
        >
          Choose a year between {model.years.from} and {model.years.to}.
        </Notice>
      )}
      {closedName && year && (
        <Notice tone="info" title={`${closedName} was closed.`}>
          It is not recorded as compatible with the {name} {year}.
          The list below is updated for {year}.
        </Notice>
      )}

      <section aria-labelledby="results-title" className="stack-md">
        <div className="section-head">
          <div>
            <p className="eyebrow">Step 3</p>
            <h2 id="results-title" className="section-title">
              Compatible parts <span className="title-variant">(Aircon parts)</span>
            </h2>
          </div>
          <p className="muted small results-count">
            {resultsReady
              ? `${matches.length} ${matches.length === 1 ? 'product' : 'products'} for the ${name} ${year}`
              : year
                ? ''
                : `${anyConfirmed} ${anyConfirmed === 1 ? 'product has' : 'products have'} confirmed records for this model`}
          </p>
        </div>

        {!year && (
          <EmptyState
            icon={<IconCar size={28} />}
            title="Select a model year"
            actions={
              <button type="button" className="btn btn--primary" onClick={focusYear}>
                Choose year
              </button>
            }
          >
            Compatibility depends on the year, so parts appear once a year is selected.
          </EmptyState>
        )}

        {year && results.status === 'loading' && (
          <Loading>Finding compatible parts…</Loading>
        )}
        {year && results.status === 'error' && (
          <LoadError
            error={results.error}
            title="Could not load compatible parts."
            onRetry={results.reload}
          />
        )}

        {resultsReady && matches.length > 0 && (
          <div className="part-grid fade-in" key={`${model.id}-${year}`}>
            {matches.map(({ product, record }) => (
              <PartCard
                key={product.id}
                product={product}
                record={record}
                onOpen={() => navigate(paths.item(model.id, product.id, year))}
              />
            ))}
          </div>
        )}

        {resultsReady && matches.length === 0 && (
          <div className="fade-in" key={`empty-${model.id}-${year}`}>
            <EmptyState
              icon={<IconCar size={28} />}
              title={
                anyConfirmed === 0
                  ? 'No matching products have been added for this vehicle yet.'
                  : 'No confirmed products for this vehicle and year.'
              }
              actions={
                <>
                  <button type="button" className="btn btn--primary" onClick={focusYear}>
                    Change year
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => navigate(paths.brand(brand.id))}
                  >
                    Change vehicle
                  </button>
                </>
              }
            >
              {anyConfirmed === 0
                ? `The ${name} has no confirmed product records in the CAA catalogue.`
                : `Other years of the ${name} have confirmed products. Try a different year.`}
            </EmptyState>
          </div>
        )}

        {pending.length > 0 && (
          <details className="pending">
            <summary>
              <span className="badge badge--verify">Needs verification</span>
              <span>
                {pending.length} {pending.length === 1 ? 'record' : 'records'} for
                this model {pending.length === 1 ? 'is' : 'are'} not shown as matches
              </span>
            </summary>
            <ul className="pending-list">
              {pending.map(({ record, product }) => (
                <li key={record.id}>
                  <strong>{product.name}</strong>{' '}
                  <span className="muted">· {formatYears(record)}</span>
                  <p className="muted small">{record.source}</p>
                </li>
              ))}
            </ul>
            {can(currentUser, 'manageRecords') ? (
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate(paths.records())}
              >
                Review in Product records
              </button>
            ) : (
              <p className="muted small">
                An editor needs to confirm these before they appear in results.
              </p>
            )}
          </details>
        )}
      </section>
    </div>
  )
}
