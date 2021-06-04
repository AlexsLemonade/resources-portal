// helpers for handling pagination
export const offsetToPage = (offset, limit) => {
  return offset === 0 ? 1 : offset / limit + 1
}

export const pageToOffset = (page, limit) => {
  return page === 1 ? 0 : (page - 1) * limit
}

export const getLastOffset = (count, limit) => {
  if (!count) return 0
  return limit > 0 ? Math.floor(count / limit) : 0
}
