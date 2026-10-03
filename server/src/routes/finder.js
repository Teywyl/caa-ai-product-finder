import express from 'express'
import { HttpError, asyncRoute } from '../http.js'
import {
  listBrands,
  listModels,
  listPendingForModel,
} from '../repos/catalogRepo.js'
import {
  findCompatibleProducts,
} from '../repos/compatibleProductsRepo.js'

const CATEGORY_SYNONYMS = [
  [
    'Cabin Filter',
    [
      'cabin filter',
      'cabin air filter',
      'aircon filter',
      'ac filter',
      'a c filter',
      'pollen filter',
      'cabin',
    ],
  ],
  [
    'Air Filter',
    ['air filter', 'engine air filter', 'engine filter', 'intake filter'],
  ],
  ['Fuel Filter', ['fuel filter', 'diesel filter', 'fuel']],
  ['Blower Motor', ['blower motor', 'blower', 'fan motor']],
  ['Evaporator', ['evaporator', 'evap', 'cooling coil']],
  ['Compressor', ['compressor']],
]

export const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const hasPhrase = (text, phrase) => {
  const p = normalize(phrase)
  return !!p && ` ${text} `.includes(` ${p} `)
}

export function parseRequest(text, brands, models) {
  const t = normalize(text)
  const result = {
    brand: null,
    models: [],
    model: null,
    year: null,
    category: null,
  }

  if (!t) return result

  for (const b of brands) {
    if (hasPhrase(t, b.name)) result.brand = b
  }

  const compactText = t.replace(/ /g, '')

  result.models = models.filter((m) => {
    if (result.brand && m.brandId !== result.brand.id) {
      return false
    }

    return m.aliases.some(
      (a) =>
        hasPhrase(t, a) ||
        hasPhrase(compactText, a.replace(/[^a-z0-9]/gi, ''))
    )
  })

  if (result.models.length === 1) {
    result.model = result.models[0]
    result.brand =
      brands.find((b) => b.id === result.model.brandId) ??
      result.brand
  }

  const year = t.match(/\b(19[89]\d|20[0-4]\d)\b/)
  if (year) result.year = Number(year[1])

  for (const [category, words] of CATEGORY_SYNONYMS) {
    if (words.some((w) => hasPhrase(t, w))) {
      result.category = category
      break
    }
  }

  return result
}

const label = (m) =>
  [m.brandName, m.name, m.variant].filter(Boolean).join(' ')

export function finderRoutes(db) {
  const router = express.Router()

  router.post(
    '/',
    asyncRoute(async (request, response) => {
      const text =
        typeof request.body?.text === 'string'
          ? request.body.text.trim()
          : ''

      if (!text) {
        throw new HttpError(400, 'text is required')
      }
      if (text.length > 300) {
        throw new HttpError(
          400,
          'text must be 300 characters or fewer'
        )
      }

      const [brands, models] = await Promise.all([
        listBrands(db),
        listModels(db),
      ])

      const p = parseRequest(text, brands, models)
      const parsed = {
        brandId: p.brand?.id ?? null,
        modelId: p.model?.id ?? null,
        year: p.year,
        category: p.category,
      }

      if (!p.model) {
        let options = models
        let prompt = 'Which vehicle is the part for?'

        if (p.models.length > 1) {
          options = p.models
          prompt = 'Which vehicle do you mean?'
        } else if (p.brand) {
          options = models.filter(
            (m) => m.brandId === p.brand.id
          )
          prompt = `Which ${p.brand.name} model?`
        }

        return response.json({
          kind: 'ask-model',
          prompt,
          parsed,
          options,
        })
      }

      if (!p.year) {
        return response.json({
          kind: 'ask-year',
          prompt: `Which year is the ${label(p.model)}?`,
          parsed,
          model: p.model,
        })
      }

      if (
        p.year < p.model.years.from ||
        p.year > p.model.years.to
      ) {
        return response.json({
          kind: 'ask-year',
          prompt:
            `${p.year} isn't in the year list for the ` +
            `${label(p.model)}. Choose a year:`,
          parsed,
          model: p.model,
        })
      }

      const all = await findCompatibleProducts(
        db,
        p.model.id,
        p.year
      )

      const matches = p.category
        ? all.filter((m) => m.product.category === p.category)
        : all

      const pending = (
        await listPendingForModel(db, p.model.id)
      ).filter(
        (x) => !p.category || x.product.category === p.category
      )

      response.json({
        kind: 'results',
        parsed,
        model: p.model,
        matches,
        totalForVehicle: all.length,
        pending,
      })
    })
  )

  return router
}
