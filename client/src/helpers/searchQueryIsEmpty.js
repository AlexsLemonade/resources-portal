// the query object should contain either facets or a search string
// anything besides that is considered empty

export const searchQueryIsEmpty = (query) => {
  const ignoredKeys = ['offset', 'limit']
  if (!query) return true
  const keys = Object.keys(query).filter((key) => !ignoredKeys.includes(key))
  if (keys.length === 0) return true
  return false
}
