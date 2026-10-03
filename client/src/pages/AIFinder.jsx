import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../lib/AppState.jsx'
import { getBrand, vehicleLabel, yearOptions } from '../lib/match.js'
import { paths } from '../lib/router.js'
import { catalogApi } from '../api/index.js'
import {
  EmptyState, LoadError, Notice, PartCard, Spinner,
} from '../components/ui.jsx'
import { IconSpark } from '../components/Icons.jsx'

const EXAMPLES = [
  'Cabin filter for Nissan Terra 2020',
  'Navara Calibre E 2021 cabin filter',
  'Fuel filter for Navara 2019',
  'Honda City 2022 aircon parts',
]

const compose = (model, year, category) =>
  [
    category ? category.toLowerCase() : '',
    'for',
    vehicleLabel(model),
    year || '',
  ].filter(Boolean).join(' ').replace(/^for /, '')

function toResult(response, catalog) {
  return {
    ...response,
    options: response.options ?? [],
    matches: response.matches ?? [],
    pending: response.pending ?? [],
    parsed: {
      model: response.model ?? null,
      brand: getBrand(catalog, response.parsed.brandId),
      year: response.parsed.year,
      category: response.parsed.category,
    },
  }
}

export function AIFinder({ query, navigate }) {
  const { catalog } = useAppState()
  const [text, setText] = useState(query.q || '')
  const [state, setState] = useState({
    status: 'idle',
    result: null,
    asked: '',
    error: null,
  })
  const inputRef = useRef(null)
  const controller = useRef(null)

  const run = async (value) => {
    const requestText = value.trim()

    if (!requestText) {
      setState({ status: 'error', result: null, asked: '', error: null })
      inputRef.current?.focus()
      return
    }

    setText(requestText)
    setState((current) => ({
      ...current,
      status: 'loading',
      asked: requestText,
      error: null,
    }))

    controller.current?.abort()
    const currentController = new AbortController()
    controller.current = currentController

    try {
      const response = await catalogApi.finder(requestText, {
        signal: currentController.signal,
      })
      if (currentController.signal.aborted) return
      setState({
        status: 'done',
        result: toResult(response, catalog),
        asked: requestText,
        error: null,
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        setState({
          status: 'failed',
          result: null,
          asked: requestText,
          error,
        })
      }
    }
  }

  useEffect(() => {
    if (query.q) run(query.q)
    return () => controller.current?.abort()
  }, [query.q])

  const result = state.result

  return (
    <div className="stack-lg">
      <div className="page-head">
        <p className="eyebrow"><IconSpark size={14} /> AI Product Finder</p>
        <h1 className="page-title">Describe the vehicle and part</h1>
        <p className="muted">
          Type it the way you’d say it.
          Results come only from confirmed records in the CAA catalogue.
        </p>
      </div>

      <Notice tone="info" title="How the Finder reads your request">
        The server picks out the brand, model, year and part type by keyword
        matching against the catalogue. An AI service is not connected yet.
        The Finder never adds compatibility, prices or shop links of its own.
      </Notice>

      <form
        className="ai-form"
        onSubmit={(event) => {
          event.preventDefault()
          run(text)
        }}
      >
        <label htmlFor="ai-query" className="field-label">Your request</label>
        <div className="ai-input-row">
          <input
            id="ai-query"
            ref={inputRef}
            className="input input--lg"
            type="text"
            placeholder="e.g. cabin filter for Nissan Terra 2020"
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-invalid={state.status === 'error'}
            aria-describedby={state.status === 'error' ? 'ai-error' : undefined}
          />
          <button
            type="submit"
            className="btn btn--primary btn--lg"
            disabled={state.status === 'loading'}
          >
            Find products
          </button>
        </div>
        {state.status === 'error' && (
          <p className="field-error" id="ai-error" role="alert">
            Type a vehicle and part, for example “fuel filter Navara 2019”.
          </p>
        )}
        <div className="examples">
          <span className="muted small">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="chip chip--btn"
              onClick={() => run(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </form>

      <section aria-labelledby="ai-results" aria-live="polite" className="stack-md">
        <h2 id="ai-results" className="sr-only">Results</h2>

        {state.status === 'idle' && (
          <EmptyState icon={<IconSpark size={28} />} title="Results appear here">
            Include the brand or model, the year, and the part you need.
          </EmptyState>
        )}
        {state.status === 'loading' && (
          <div className="loading-row">
            <Spinner label="Searching the catalogue" /> Searching the catalogue…
          </div>
        )}
        {state.status === 'failed' && (
          <LoadError
            error={state.error}
            title="The search did not finish."
            onRetry={() => run(state.asked)}
          />
        )}

        {state.status === 'done' && result && (
          <div className="stack-md fade-in" key={state.asked}>
            <div className="reading">
              <span className="muted small">Read as</span>
              <span className="tag">
                Vehicle: {result.parsed.model
                  ? vehicleLabel(result.parsed.model)
                  : result.parsed.brand
                    ? `${result.parsed.brand.name} (model?)`
                    : '—'}
              </span>
              <span className="tag">Year: {result.parsed.year ?? '—'}</span>
              <span className="tag">Part: {result.parsed.category ?? 'Any'}</span>
            </div>

            {result.kind === 'ask-model' && (
              <div className="ask">
                <p className="ask-q">{result.prompt}</p>
                <div className="chip-row">
                  {result.options.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      className="chip chip--btn"
                      onClick={() => run(compose(
                        model, result.parsed.year, result.parsed.category
                      ))}
                    >
                      {vehicleLabel(model)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {result.kind === 'ask-year' && (
              <div className="ask">
                <p className="ask-q">{result.prompt}</p>
                <div className="chip-row">
                  {yearOptions(result.parsed.model).map((year) => (
                    <button
                      key={year}
                      type="button"
                      className="chip chip--btn num"
                      onClick={() => run(compose(
                        result.parsed.model, year, result.parsed.category
                      ))}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {result.kind === 'results' && (
              <>
                <p className="result-count">
                  {result.matches.length > 0
                    ? `${result.matches.length} confirmed ${result.matches.length === 1 ? 'match' : 'matches'} for the ${vehicleLabel(result.parsed.model)} ${result.parsed.year}`
                    : null}
                </p>

                {result.matches.length > 0 ? (
                  <div className="part-grid">
                    {result.matches.map(({ product, record }) => (
                      <PartCard
                        key={product.id}
                        product={product}
                        record={record}
                        onOpen={() => navigate(paths.item(
                          result.parsed.model.id,
                          product.id,
                          result.parsed.year
                        ))}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={
                      result.parsed.category
                        ? `No confirmed ${result.parsed.category.toLowerCase()} for the ${vehicleLabel(result.parsed.model)} ${result.parsed.year}.`
                        : 'No confirmed products for this vehicle and year.'
                    }
                    actions={
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => navigate(paths.vehicle(
                          result.parsed.model.id, result.parsed.year
                        ))}
                      >
                        Open {vehicleLabel(result.parsed.model)} {result.parsed.year}
                      </button>
                    }
                  >
                    {result.parsed.category && result.totalForVehicle > 0
                      ? `${result.totalForVehicle} other ${result.totalForVehicle === 1 ? 'product is' : 'products are'} confirmed for this vehicle and year.`
                      : 'Nothing in the catalogue is confirmed for this request.'}
                  </EmptyState>
                )}

                {result.pending.length > 0 && (
                  <Notice
                    tone="warn"
                    title={`${result.pending.length} related ${result.pending.length === 1 ? 'record needs' : 'records need'} verification`}
                  >
                    {result.pending.map((item) => item.product.name).join(', ')}
                    {' '}{result.pending.length === 1 ? 'is' : 'are'} on record
                    for this model but not confirmed, so{' '}
                    {result.pending.length === 1 ? 'it is' : 'they are'} not
                    shown as matches.
                  </Notice>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
