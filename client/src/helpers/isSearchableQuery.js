// if a category is selected only search is a search term is provided

export default (query) => {
  if (!query) return false
  if (query.category && !query.search) return false
  if (Object.keys(query).length === 0) return false
  return true
}
