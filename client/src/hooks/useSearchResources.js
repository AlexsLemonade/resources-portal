import React from 'react'
import { ResourcesPortalContext } from '../ResourcesPortalContext'
import { useSearch } from './useSearch'

export const useSearchResources = (newSearch) => {
  const { search, setSearch } = React.useContext(ResourcesPortalContext)
  // Should only be populated by results from get initial props
  if (newSearch) Object.assign(search, newSearch)

  const baseSearch = useSearch(search, setSearch)

  return {
    ...baseSearch,
    query: search.query,
    response: search.response
  }
}
