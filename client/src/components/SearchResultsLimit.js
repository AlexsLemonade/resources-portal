import React from 'react'
import { Box, Select, Paragraph } from 'grommet'
import { useSearchResources } from '../hooks/useSearchResources'

export const limitOptions = ['10', '25', '50', '100']

export const SearchResultsLimit = () => {
  const {
    query: { limit },
    response: { count },
    setLimit,
    goToSearchResults
  } = useSearchResources()

  React.useEffect(() => {
    if (!limit) setLimit(limitOptions[0])
  })

  return (
    <Box direction="row" align="center">
      <Paragraph margin="none">Showing</Paragraph>
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
      <Paragraph margin="none">of {count}</Paragraph>
    </Box>
  )
}

export default SearchResultsLimit
