import { useEffect } from 'react'
import { useAppState } from '../lib/AppState.jsx'
import {
  formatYears,
  getBrand,
  getModel,
  isYearSelectable,
  vehicleLabel,
  yearOptions,
} from '../lib/match.js'
import { paths } from '../lib/router.js'
import { useApi } from '../lib/useApi.js'
import { catalogApi, productsApi } from '../api/index.js'
import {
  BackLink,
  BrandMark,
  EmptyState,
  LoadError,
  Loading,
  MARKETPLACES,
  MarketTile,
  StatusBadge,
  stockText,
  YearSelect,
} from '../components/ui.jsx'
import { CategoryArt } from '../components/Icons.jsx'
import { VehicleStage } from '../components/VehicleVisual.jsx'

const closedLink = (modelId, year, name) =>
  `${paths.vehicle(modelId, year)}${
    year ? '&' : '?'
  }closedName=${encodeURIComponent(name)}`

export function Item({ modelId, productId, query, navigate }) {
  const { catalog } = useAppState()
  const model = getModel(catalog, modelId)
  const year =
    model && isYearSelectable(model, Number(query.year))
      ? Number(query.year)
      : null

  const loaded = useApi(
    async (signal) => {
      const [{ product }, fit] = await Promise.all([
        productsApi.get(productId, { signal }),
        model && year
          ? catalogApi.compatibleProducts(model.id, year, { signal })
          : null,
      ])

      return {
        product,
        compatible: !!fit?.matches.some(
          (match) => String(match.product.id) === String(productId)
        ),
      }
    },
    [productId, model?.id, year]
  )

  const product = loaded.data?.product
  const compatible =
    loaded.status === 'ok' && loaded.data.compatible

  useEffect(() => {
    if (model && loaded.status === 'ok' && !compatible) {
      navigate(
        closedLink(model.id, year, product.name),
        { replace: true }
      )
    }
  }, [model?.id, loaded.status, compatible])

  if (loaded.status === 'loading') {
    return <Loading>Loading product…</Loading>
  }

  if (
    !model ||
    (loaded.status === 'error' && loaded.error.status === 404)
  ) {
    return (
      <EmptyState
        title="That product is not in the catalogue"
        actions={
          <button
            type="button"
            className="btn btn--primary"
            onClick={() =>
              navigate(
                model ? paths.vehicle(model.id, year) : paths.home()
              )
            }
          >
            {model ? 'Back to products' : 'Choose vehicle'}
          </button>
        }
      >
        It may have been removed from the records.
      </EmptyState>
    )
  }

  if (loaded.status === 'error') {
    return (
      <LoadError
        error={loaded.error}
        title="Could not load this product."
        onRetry={loaded.reload}
      />
    )
  }

  if (!compatible) return null

  const brand = getBrand(catalog, model.brandId)
  const records = product.compatibility

  const changeYear = async (nextYear) => {
    try {
      const fit = await catalogApi.compatibleProducts(
        model.id,
        nextYear
      )

      if (fit.matches.some((match) => match.product.id === product.id)) {
        navigate(
          paths.item(model.id, product.id, nextYear),
          { replace: true }
        )
      } else {
        navigate(closedLink(model.id, nextYear, product.name))
      }
    } catch {
      navigate(paths.vehicle(model.id, nextYear))
    }
  }

  return (
    <div className="stack-lg fade-in">
      <BackLink onClick={() => navigate(paths.vehicle(model.id, year))}>
        Back to compatible parts
      </BackLink>

      <VehicleStage
        model={model}
        compact
        brandSlot={
          <span className="stage-brand">
            <BrandMark brand={brand} size="sm" />
            {brand.name}
          </span>
        }
      >
        <p className="stage-title stage-title--sm">
          {vehicleLabel(model)}
        </p>
        <YearSelect
          model={model}
          years={yearOptions(model)}
          value={year}
          onChange={changeYear}
          id="item-year"
        />
      </VehicleStage>

      <article className="item" aria-labelledby="item-title">
        <header className="item-head">
          <span className="item-art" aria-hidden="true">
            <CategoryArt category={product.category} size={64} />
          </span>
          <div className="item-head-text">
            <p className="eyebrow">
              {product.category !== product.name
                ? product.category
                : 'Aircon part'}
            </p>
            <h1 id="item-title" className="item-title">
              {product.name}
            </h1>
            {product.partNumber && (
              <p className="item-pn">
                Part no. <span className="num">{product.partNumber}</span>
              </p>
            )}
          </div>
        </header>

        <section aria-labelledby="shop-title" className="shops">
          <h2 id="shop-title" className="sr-only">Shop links</h2>
          <div className="market-list">
            {MARKETPLACES.map((market) => (
              <MarketTile
                key={market.key}
                market={market}
                url={product.links?.[market.key]}
              />
            ))}
          </div>
          <p className="muted small">
            Links open our own listing in a new tab.
            Price and stock are shown on the marketplace.
          </p>
        </section>

        <div className="item-details">
          <dl className="facts-list">
            <div>
              <dt>Fits</dt>
              <dd>
                {vehicleLabel(model)} <span className="num">{year}</span>
              </dd>
            </div>
            <div>
              <dt>Catalogue</dt>
              <dd>
                {product.listed ? 'Listed in CAA catalogue' : 'Not listed'}
              </dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>
                {stockText(product.stock)}
                {product.stock?.status === 'unconfirmed' && (
                  <span className="muted">
                    {' '}· check the marketplace listing
                  </span>
                )}
              </dd>
            </div>
            {product.pricePhp != null && (
              <div>
                <dt>Recorded price</dt>
                <dd>
                  <span className="num">
                    ₱{product.pricePhp.toLocaleString(
                      'en-PH',
                      { minimumFractionDigits: 2 }
                    )}
                  </span>
                  <span className="muted">
                    {' '}· the marketplace price is the current one
                  </span>
                </dd>
              </div>
            )}
          </dl>

          <div className="item-desc">
            <h2 className="section-title section-title--sm">
              Description
            </h2>
            <p>{product.description || 'No description recorded yet.'}</p>
            <p className="muted small">
              Category illustration shown. No product photo has been recorded.
            </p>
          </div>
        </div>
      </article>

      <section aria-labelledby="compat-title" className="stack-md">
        <h2 id="compat-title" className="section-title section-title--sm">
          Recorded compatibility
        </h2>
        <div className="table-wrap table-wrap--stack">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Vehicle</th>
                <th scope="col">Years</th>
                <th scope="col">Status</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const current = record.modelId === model.id

                return (
                  <tr
                    key={record.id}
                    className={current ? 'is-current' : ''}
                  >
                    <td data-label="Vehicle">
                      {record.vehicle}
                      {current && (
                        <span className="sr-only">
                          {' '}(selected vehicle)
                        </span>
                      )}
                    </td>
                    <td data-label="Years" className="num nowrap">
                      {formatYears(record)}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={record.status} />
                    </td>
                    <td data-label="Source" className="muted small">
                      {record.source}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
