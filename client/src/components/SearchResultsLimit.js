import React from 'react'
import { Box, Select } from 'grommet'
import { useMaterialsSearch } from '../hooks/useMaterialsSearch'

export const limitOptions = ['10', '25', '50', '100']

export const SearchResultsLimit = () => {
  const {
    query: { limit },
    response: { count },
    setLimit,
    goToSearchResults
  } = useMaterialsSearch()

  React.useEffect(() => {
    if (!limit) setLimit(limitOptions[0])
  })

  return (
    <Box direction="row" align="center">
      Showing
      <Box width={{ max: 'small' }} margin={{ horizontal: 'small' }}>
        <Select
          options={limitOptions}
          value={limit || limitOptions[0]}
          onChange={({ option }) => {
            setLimit(option)
            goToSearchResults()
          }}
        />
      </Box>
      of {count}
    </Box>
  )
}

export default SearchResultsLimit
