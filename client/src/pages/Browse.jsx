import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppState } from '../lib/AppState.jsx'
import { getBrand, getModel, modelsForBrand, vehicleLabel } from '../lib/match.js'
import { paths } from '../lib/router.js'
import {
  BackLink, BrandCard, BrandMark, EmptyState,
  GarageSlot, LockedSlot, ModelCard,
} from '../components/ui.jsx'
import { useBrandIntro } from '../components/BrandIntro.jsx'
import { Arc360 } from '../components/VehicleVisual.jsx'
import { Car3D } from '../components/Car3D.jsx'
import {
  IconChevronLeft, IconChevronRight, IconSpark,
} from '../components/Icons.jsx'

function BrandCarousel({ navigate, selectedBrandId }) {
  const { catalog } = useAppState()
  const { play } = useBrandIntro()
  const row = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const el = row.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const scroll = (direction) => {
    const el = row.current
    if (!el) return
    const card = el.querySelector('.brand-row-item')
    const step = card
      ? card.getBoundingClientRect().width + 16
      : el.clientWidth * 0.8
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <div className="carousel">
      <div
        className="brand-row"
        ref={row}
        onScroll={update}
        role="list"
        aria-label="Vehicle brands"
      >
        {catalog.brands.map((brand) => (
          <div role="listitem" key={brand.id} className="brand-row-item">
            <BrandCard
              brand={brand}
              models={modelsForBrand(catalog, brand.id)}
              selected={selectedBrandId === brand.id}
              onSelect={(event, rect) =>
                play(brand, rect, () => navigate(paths.brand(brand.id)))
              }
            />
          </div>
        ))}
      </div>
      <div className="carousel-arrows" hidden={edges.start && edges.end}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => scroll(-1)}
          disabled={edges.start}
          aria-label="Scroll brands left"
        >
          <IconChevronLeft />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => scroll(1)}
          disabled={edges.end}
          aria-label="Scroll brands right"
        >
          <IconChevronRight />
        </button>
      </div>
    </div>
  )
}

export function Home({ navigate }) {
  const { lastVehicle, catalog, design } = useAppState()
  const brandsRef = useRef(null)
  const last = lastVehicle
    ? getModel(catalog, lastVehicle.modelId)
    : null

  const previewModel =
    last ||
    catalog.models.find((model) => model.reference.model) ||
    catalog.models[0]

  const toBrands = () => {
    brandsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    brandsRef.current?.querySelector('.brand-card')?.focus({
      preventScroll: true,
    })
  }

  return (
    <div className="stack-xl">
      <section className="hero on-dark" aria-labelledby="hero-title">
        <span className="hero-word" aria-hidden="true">
          {(last ? last.name : 'Cabalen').toUpperCase()}
        </span>
        <div className="hero-copy">
          <p className="eyebrow eyebrow--light">
            Cabalen Auto Aircon · Private catalogue
          </p>
          <h1 id="hero-title" className="display">
            <span className="display-a">Aircon parts</span>{' '}
            <span className="display-b">that fit your vehicle.</span>
          </h1>
          <p className="lede lede--light">
            Choose a brand, model and year. See only the products
            we’ve recorded as compatible, then open our exact
            Lazada, Shopee or TikTok listing.
          </p>
        </div>

        <button
          type="button"
          className="hero-vehicle"
          onClick={() =>
            last
              ? navigate(paths.vehicle(last.id, lastVehicle.year))
              : toBrands()
          }
        >
          <span className="hero-vehicle-art">
            <Arc360 />
            <Car3D
              body={previewModel?.body ?? 'suv'}
              modelUrl={previewModel?.reference.model?.file}
              label={
                previewModel
                  ? `3D preview of the ${vehicleLabel(previewModel)}`
                  : '3D preview of a vehicle'
              }
              interactive={false}
              design={design}
              distance={6.2}
              className="hero-car"
            />
          </span>
          <span className="hero-vehicle-label">
            <span className="hero-vehicle-kicker">
              {last ? 'Continue with' : 'Select to choose your vehicle'}
            </span>
            <span className="hero-vehicle-name">
              {last ? (
                <>
                  {vehicleLabel(last)}
                  {lastVehicle.year && (
                    <span className="num"> · {lastVehicle.year}</span>
                  )}
                </>
              ) : 'Brand, then model'}
              <IconChevronRight size={20} />
            </span>
          </span>
        </button>

        <div className="hero-actions">
          <button
            type="button"
            className="btn btn--light btn--lg hero-cta"
            onClick={toBrands}
          >
            {last ? 'Change vehicle' : 'Choose vehicle'}
          </button>
          <button
            type="button"
            className="btn btn--outline-light btn--lg"
            onClick={() => navigate(paths.ai())}
          >
            <IconSpark size={18} /> Ask AI Finder
          </button>
        </div>

        <dl className="hero-stats">
          <div><dt>Brands</dt><dd className="num">{catalog.brands.length}</dd></div>
          <div><dt>Models</dt><dd className="num">{catalog.models.length}</dd></div>
          <div><dt>Products on record</dt><dd className="num">{catalog.productCount}</dd></div>
        </dl>
      </section>

      <section
        aria-labelledby="choose-title"
        ref={brandsRef}
        className="scroll-target"
      >
        <div className="section-head">
          <div>
            <p className="eyebrow">Step 1</p>
            <h2 id="choose-title" className="section-title">
              Browse by vehicle brand
            </h2>
          </div>
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate(paths.brands())}
          >
            All models <IconChevronRight size={16} />
          </button>
        </div>
        <BrandCarousel navigate={navigate} selectedBrandId={last?.brandId} />
      </section>

      <section className="facts" aria-label="How results work">
        <div className="fact">
          <h3 className="fact-title">Confirmed fits only</h3>
          <p className="muted small">
            A product appears only when a confirmed record covers
            the selected model and year.
          </p>
        </div>
        <div className="fact">
          <h3 className="fact-title">Listed is not in stock</h3>
          <p className="muted small">
            “Listed in CAA catalogue” means we sell it.
            The marketplace listing shows current stock.
          </p>
        </div>
        <div className="fact">
          <h3 className="fact-title">Exact shop links</h3>
          <p className="muted small">
            Each button opens that product’s own listing in a new tab.
            {' '}{catalog.productCount} products are on record.
          </p>
        </div>
      </section>
    </div>
  )
}

export function Brands({ navigate }) {
  const { catalog } = useAppState()
  const { play } = useBrandIntro()

  return (
    <div className="stack-xl">
      <div className="page-head">
        <p className="eyebrow">Vehicle selection</p>
        <h1 className="page-title">All brands and models</h1>
        <p className="muted">
          {catalog.models.length} models across {catalog.brands.length} brands.
        </p>
      </div>
      {catalog.brands.map((brand) => (
        <section
          key={brand.id}
          aria-labelledby={`brand-${brand.id}`}
          className="stack-md"
        >
          <div className="section-head">
            <div className="brand-heading">
              <BrandMark brand={brand} />
              <h2 id={`brand-${brand.id}`} className="section-title">
                {brand.name}
              </h2>
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={(event) => {
                const mark = event.currentTarget
                  .closest('.section-head')
                  ?.querySelector('.brand-mark')
                play(
                  brand,
                  mark?.getBoundingClientRect(),
                  () => navigate(paths.brand(brand.id))
                )
              }}
            >
              Open {brand.name} garage <IconChevronRight size={16} />
            </button>
          </div>
          <div className="model-grid">
            {modelsForBrand(catalog, brand.id).map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                count={model.confirmedProductCount}
                onSelect={() => navigate(paths.vehicle(model.id))}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const GARAGE_SLOTS = 12

export function BrandModels({ brandId, navigate }) {
  const { catalog } = useAppState()
  const brand = getBrand(catalog, brandId)

  if (!brand) {
    return (
      <EmptyState
        title="That brand is not in the catalogue"
        actions={
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate(paths.home())}
          >
            Choose a brand
          </button>
        }
      >
        Pick one of the brands on Home.
      </EmptyState>
    )
  }

  const models = modelsForBrand(catalog, brand.id)
  const total = Math.max(GARAGE_SLOTS, models.length)
  const locked = total - models.length

  return (
    <div className="stack-lg garage-page">
      <BackLink onClick={() => navigate(paths.home())}>All brands</BackLink>
      <header className="garage-head">
        <BrandMark brand={brand} size="xl" />
        <div className="garage-title">
          <p className="eyebrow">Step 2 · Garage</p>
          <h1 className="page-title">{brand.name}</h1>
          <p className="muted">
            Select an available model to see its compatible aircon parts.
          </p>
        </div>
        <div
          className="garage-progress"
          aria-label={`${models.length} of ${total} slots available`}
        >
          <span className="garage-count num">
            <strong>{String(models.length).padStart(2, '0')}</strong>
            <span>/ {total}</span>
          </span>
          <span className="garage-count-label">Models available</span>
          <span className="garage-segs" aria-hidden="true">
            {Array.from({ length: total }, (_, index) => (
              <span
                key={index}
                className={index < models.length ? 'is-on' : ''}
                style={{ '--i': index }}
              />
            ))}
          </span>
        </div>
      </header>

      <div
        className="garage"
        aria-label={`${brand.name} garage: ${models.length} available, ${locked} locked`}
      >
        {models.map((model, index) => (
          <GarageSlot
            key={model.id}
            model={model}
            index={index}
            total={total}
            count={model.confirmedProductCount}
            onSelect={() => navigate(paths.vehicle(model.id))}
          />
        ))}
        {Array.from({ length: locked }, (_, index) => (
          <LockedSlot
            key={`locked-${index}`}
            index={models.length + index}
            total={total}
          />
        ))}
      </div>
    </div>
  )
}
