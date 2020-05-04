import React from 'react'
import { Box, Grid } from 'grommet'

import { searchQueryIsEmpty } from '../helpers/searchQueryIsEmpty'
import { searchMaterials } from '../api/search'

import SearchInput from '../components/SearchInput'
import { SearchResultsLimit } from '../components/SearchResultsLimit'
import { SearchResultsFilters } from '../components/SearchResultsFilters'
import { SearchResultsOffset } from '../components/SearchResultsOffset'
import { SearchResult } from '../components/resources'

import { useMaterialsSearch } from '../hooks/useMaterialsSearch'

const Search = (search) => {
  const { response } = useMaterialsSearch(search)

  return (
    <>
      <Box pad={{ horizontal: '144px' }} margin={{ bottom: 'xlarge' }}>
        <SearchInput />
      </Box>
      {!response && <Box>Waiting on dizzies</Box>}
      {response && (
        <Grid
          fill
          rows={['auto', 'flex']}
          columns={['auto', 'flex']}
          gap="gutter"
          areas={[
            { name: 'searchLimit', start: [1, 0], end: [1, 1] },
            { name: 'filters', start: [0, 0], end: [0, 1] },
            { name: 'results', start: [1, 1], end: [1, 1] }
          ]}
        >
          <Box gridArea="filters" width="medium">
            <SearchResultsFilters />
          </Box>
          <Box gridArea="searchLimit">
            <SearchResultsLimit />
          </Box>
          <Box gridArea="results">
            {response.results.map((result) => (
              <SearchResult key={result.id} resource={result} />
            ))}
            <SearchResultsOffset />
          </Box>
        </Grid>
      )}
    </>
  )
}

Search.getInitialProps = async ({ pathname, query }) => {
  // navigate to new page with new search query
  // default the size of the page to 10 results
  const searchQuery = { limit: 10, ...query }
  const response = !searchQueryIsEmpty(query)
    ? await searchMaterials({ limit: '10', ...query })
    : false

  return {
    pathname,
    query: searchQuery,
    response
  }
}

export default Search
