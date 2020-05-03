import React from 'react'
import { useRouter } from 'next/router'
import { ResourcesPortalContext } from '../ResouresPortalContext'

export const useMaterialsSearch = (newSearch) => {
  const { search, setSearch } = React.useContext(ResourcesPortalContext)
  const router = useRouter()
  // Should only be populated by results from get initial props
  if (newSearch) Object.assign(search, newSearch)

  const goToSearchResults = (goToStart = false) => {
    if (goToStart) delete search.query.offset
    const { pathname, query } = search
    router.push({ pathname, query })
  }

  const setSearchString = (searchString, resetQuery = false) => {
    // should this clear the search facets?
    if (resetQuery) search.query = {}
    search.query.search = searchString
    setSearch({ ...search })
  }

  const addFacet = (facet, value) => {
    if (value) {
      const newFacet = new Set(search.query[facet] || [])
      newFacet.add(value)
      search.query[facet] = [...newFacet]
    } else {
      search.query[facet] = true
    }
    setSearch({ ...search })
  }

  const removeFacet = (facet, value) => {
    if (value) {
      const newFacet = new Set(search.query[facet])
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
    setSearchString,
    addFacet,
    removeFacet,
    toggleFacet,
    setLimit,
    setOffset,
    query: search.query,
    response: search.response,
    goToSearchResults
  }
}
