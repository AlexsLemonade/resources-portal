// if a category is selected only search is a search term is provided

export default (query) => {
  return query || Object.keys(query).length !== 0
}
