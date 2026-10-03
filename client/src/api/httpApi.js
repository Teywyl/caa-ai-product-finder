import { request } from './client.js'

const id = encodeURIComponent

export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),
}

export const catalogApi = {
  brands: () => request('/brands'),

  models: () => request('/models'),

  model: (modelId) =>
    request(`/models/${id(modelId)}`),

  pending: (modelId, opts) =>
    request(`/models/${id(modelId)}/pending`, opts),

  compatibleProducts: (modelId, year, opts) =>
    request(
      `/models/${id(modelId)}/products?year=${id(year)}`,
      opts
    ),

  finder: (text, opts) =>
    request('/finder', {
      method: 'POST',
      body: { text },
      ...opts,
    }),
}

export const productsApi = {
  list: () => request('/products'),

  get: (productId, opts) =>
    request(`/products/${id(productId)}`, opts),

  create: (product) =>
    request('/products', {
      method: 'POST',
      body: product,
    }),

  update: (productId, product) =>
    request(`/products/${id(productId)}`, {
      method: 'PUT',
      body: product,
    }),

  remove: (productId) =>
    request(`/products/${id(productId)}`, {
      method: 'DELETE',
    }),
}

export const compatibilityApi = {
  list: (modelId) =>
    request(
      `/compatibility${
        modelId ? `?modelId=${id(modelId)}` : ''
      }`
    ),

  create: (record) =>
    request('/compatibility', {
      method: 'POST',
      body: record,
    }),

  update: (recordId, record) =>
    request(`/compatibility/${id(recordId)}`, {
      method: 'PUT',
      body: record,
    }),

  remove: (recordId) =>
    request(`/compatibility/${id(recordId)}`, {
      method: 'DELETE',
    }),
}

export const usersApi = {
  list: () => request('/users'),

  create: (user) =>
    request('/users', {
      method: 'POST',
      body: user,
    }),

  update: (userId, changes) =>
    request(`/users/${id(userId)}`, {
      method: 'PATCH',
      body: changes,
    }),

  remove: (userId) =>
    request(`/users/${id(userId)}`, {
      method: 'DELETE',
    }),
}
