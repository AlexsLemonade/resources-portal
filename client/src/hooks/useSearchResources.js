import React from 'react'
import { ResourcesPortalContext } from 'ResourcesPortalContext'
import { useSearch } from 'hooks/useSearch'

export const useSearchResources = (newSearch) => {
  const { search, setSearch } = React.useContext(ResourcesPortalContext)
  // Should only be populated by results from get initial props
  if (newSearch) Object.assign(search, newSearch)

  const baseSearch = useSearch(search, setSearch)

  const count = parseInt(search.response.count, 10) || 0
  const offset = parseInt(search.query.offset, 10) || 0
  const limit = parseInt(search.query.limit, 10) || 10
  const remainder = count % limit
  const fromEnd = remainder === 0 ? limit : remainder
  const last = count && limit > 0 ? count - fromEnd : 0

  return {
    ...baseSearch,
    query: search.query,
    response: search.response,
    pagination: {
      count,
      offset,
      limit,
      last
    }
  }
}
