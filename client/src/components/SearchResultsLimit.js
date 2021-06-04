import React from 'react'
import { Box, Paragraph, Select, Text } from 'grommet'
import { useSearchResources } from '../hooks/useSearchResources'

export const limitOptions = ['10', '25', '50', '100']

export const SearchResultsLimit = () => {
  const {
    query: { limit },
    response: { count },
    setLimit,
    setOffset,
    goToSearchResults
  } = useSearchResources()

  React.useEffect(() => {
    if (!limit) setLimit(limitOptions[0])
  })

  return (
    <Box direction="row" align="center">
      <Paragraph margin="none">Showing</Paragraph>
      <Box width="70px" margin={{ horizontal: 'small' }}>
        <Select
          options={limitOptions}
          value={limit || limitOptions[0]}
          onChange={({ option }) => {
            setLimit(option)
            setOffset(0)
            goToSearchResults()
          }}
        />
      </Box>
      <Paragraph margin="none">
        per page of <Text weight="bold">{count}</Text>
      </Paragraph>
    </Box>
  )
}

export default SearchResultsLimit
