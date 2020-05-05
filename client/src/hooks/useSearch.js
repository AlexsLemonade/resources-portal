import { useRouter } from 'next/router'

export const useSearch = (state, setState) => {
  const search = state
  const setSearch = setState
  const router = useRouter()

  const goToSearchResults = (goToStart = false) => {
    if (goToStart) delete search.query.offset
    const { pathname, query } = search
    router.push({ pathname, query })
  }

  const setSearchTerm = (searchTerm, resetQuery = false) => {
    // should this clear the search facets?
    if (resetQuery) search.query = {}
    if (searchTerm === '') {
      delete search.query.search
    } else {
      search.query.search = searchTerm
    }

    setSearch({ ...search })
  }

  // get a set of unique items we can add to or delete from
  const getSetFromFacet = (facet) => {
    const existingFacet = search.query[facet]
    if (!existingFacet) return new Set()
    if (Array.isArray(existingFacet)) return new Set(existingFacet)
    return new Set([existingFacet])
  }

  const addFacet = (facet, value) => {
    if (value) {
      const newFacet = getSetFromFacet(facet)
      newFacet.add(value)
      search.query[facet] = [...newFacet]
    } else {
      search.query[facet] = true
    }
    setSearch({ ...search })
  }

  const removeFacet = (facet, value) => {
    if (value) {
      const newFacet = getSetFromFacet(facet)
      newFacet.delete(value)
      search.query[facet] = [...newFacet]
    }

    if (!value || search.query[facet].length === 0) {
      delete search.query[facet]
    }
    setSearch({ ...search })
  }

  const toggleFacet = (toggle, facet, value) => {
    if (toggle) {
      addFacet(facet, value)
    } else {
      removeFacet(facet, value)
    }
  }

  const hasFacet = (facet, value = true) => {
    const queryFacet = search.query[facet]
    if (Array.isArray(queryFacet)) {
      return queryFacet.includes(value)
    }

    if (typeof value === 'string') {
      return queryFacet === value
    }

    return facet in search.query
  }

  const hasAnyFacet = () => {
    const { facets } = search.response
    let hasFacets = false
    Object.keys(facets).forEach((facet) => {
      if (facet in search.query) hasFacets = true
    })

    return hasFacets
  }

  const clearFacets = () => {
    const { facets } = search.response
    Object.keys(facets || {}).forEach((facet) => removeFacet(facet))
  }

  const setLimit = (limit) => {
    search.query.limit = limit
    setSearch({ ...search })
  }

  const setOffset = (offset) => {
    search.query.offset = offset
    setSearch({ ...search })
  }

  return {
    setSearchTerm,
    addFacet,
    removeFacet,
    toggleFacet,
    hasFacet,
    hasAnyFacet,
    clearFacets,
    setLimit,
    setOffset,
    goToSearchResults
  }
}
