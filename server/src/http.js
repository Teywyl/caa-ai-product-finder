export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next)
}

export function parseId(value, label = 'id') {
  const id = Number(value)

  if (!Number.isSafeInteger(id) || id < 1 || String(id) !== String(value)) {
    throw new HttpError(400, `${label} must be a positive whole number`)
  }

  return id
}

export function databaseErrorToHttp(error) {
  switch (error.code) {
    case '23505':
      return new HttpError(409, 'That record already exists.')
    case '23503':
      return new HttpError(400, 'It refers to a record that does not exist.')
    case '23514':
    case '22P02':
    case '22003':
    case '22007':
    case '22008':
      return new HttpError(400, 'One of the values is not allowed.')
    default:
      return null
  }
}
