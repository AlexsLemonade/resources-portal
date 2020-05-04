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

  // get a list of unique items we can add to or delete from
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

  const setLimit = (limit) => {
    search.query.limit = limit
    setSearch({ ...search })
  }

  const setOffset = (offset) => {
    search.query.offset = offset
    setSearch({ ...search })
  }

  return {
    addFacet,
    removeFacet,
    toggleFacet,
    setLimit,
    setOffset,
    goToSearchResults
  }
}
