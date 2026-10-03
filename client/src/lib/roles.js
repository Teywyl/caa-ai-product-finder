export const roles = [
  {
    id: 'viewer',
    name: 'Viewer',
    summary:
      'Browse vehicles, compatible products, shop links and the Finder.',
  },
  {
    id: 'editor',
    name: 'Editor',
    summary:
      'Everything a Viewer can do, plus add, edit and delete product records and compatibility.',
  },
  {
    id: 'admin',
    name: 'Admin',
    summary:
      'Everything an Editor can do, plus manage user accounts and roles.',
  },
]

export const roleName = (id) =>
  roles.find((r) => r.id === id)?.name ?? id

export const can = (user, action) => {
  if (!user) return false

  if (action === 'manageRecords') {
    return user.role === 'editor' || user.role === 'admin'
  }

  if (action === 'manageUsers') {
    return user.role === 'admin'
  }

  return true
}

export const CATEGORIES = [
  'Evaporator',
  'Cabin Filter',
  'Air Filter',
  'Fuel Filter',
  'Blower Motor',
  'Compressor',
]
