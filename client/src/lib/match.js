export const getBrand = (catalog, id) =>
  catalog.brands.find((b) => b.id === id) || null

export const getModel = (catalog, id) =>
  catalog.models.find((m) => m.id === id) || null

export const modelsForBrand = (catalog, brandId) =>
  catalog.models.filter((m) => m.brandId === brandId)

export const modelLabel = (model) =>
  model
    ? [model.name, model.variant].filter(Boolean).join(' ')
    : ''

export const vehicleLabel = (model) =>
  model
    ? `${model.brandName ?? ''} ${modelLabel(model)}`.trim()
    : ''

export function yearOptions(model) {
  if (!model) return []

  const years = []
  for (
    let year = model.years.to;
    year >= model.years.from;
    year -= 1
  ) {
    years.push(year)
  }

  return years
}

export function isYearSelectable(model, year) {
  return (
    !!model &&
    Number.isInteger(year) &&
    year >= model.years.from &&
    year <= model.years.to
  )
}

export function formatYears(record) {
  if (record.yearFrom == null && record.yearTo == null) {
    return 'Years not recorded'
  }

  if (record.yearFrom != null && record.yearTo == null) {
    return `${record.yearFrom} onward`
  }

  if (record.yearFrom === record.yearTo) {
    return String(record.yearFrom)
  }

  return `${record.yearFrom ?? '?'}–${record.yearTo ?? '?'}`
}

export const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export function searchVehicles(catalog, query) {
  const q = normalize(query)
  if (!q) return []

  const qCompact = q.replace(/ /g, '')
  const results = []

  for (const brand of catalog.brands) {
    const name = normalize(brand.name)

    if (name.includes(q)) {
      results.push({
        type: 'brand',
        id: brand.id,
        brand,
        score: name.startsWith(q) ? 2 : 1,
      })
    }
  }

  for (const model of catalog.models) {
    const brand = getBrand(catalog, model.brandId)
    const names = [
      modelLabel(model),
      `${brand?.name ?? ''} ${modelLabel(model)}`,
      ...model.aliases,
    ].map(normalize)

    const compact = names.map((name) =>
      name.replace(/ /g, '')
    )

    const hit =
      names.some((name) => name.includes(q)) ||
      compact.some((name) => name.includes(qCompact))

    if (hit) {
      results.push({
        type: 'model',
        id: model.id,
        model,
        brand,
        score: names.some((name) => name.startsWith(q))
          ? 3
          : 1,
      })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
}
