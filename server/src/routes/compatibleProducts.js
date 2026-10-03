import { HttpError, asyncRoute } from '../http.js'
import { getModel } from '../repos/catalogRepo.js'
import {
  findCompatibleProducts,
} from '../repos/compatibleProductsRepo.js'
import { parseYear } from '../validate.js'

export function compatibleProductsRoute(db) {
  return asyncRoute(async (request, response) => {
    const model = await getModel(
      db,
      request.params.modelId
    )

    if (!model) {
      throw new HttpError(
        404,
        'No vehicle model with that id.'
      )
    }

    if (typeof request.query.year !== 'string') {
      throw new HttpError(
        400,
        'Select a vehicle year.'
      )
    }

    const year = parseYear(request.query.year)

    if (!Number.isInteger(year)) {
      throw new HttpError(
        400,
        'Year must be a valid whole number.'
      )
    }

    if (
      year < model.years.from ||
      year > model.years.to
    ) {
      throw new HttpError(
        400,
        `Select a year from ${model.years.from} to ${model.years.to}.`
      )
    }

    const matches = await findCompatibleProducts(
      db,
      model.id,
      year
    )

    response.json({
      model,
      year,
      matches,
    })
  })
}
