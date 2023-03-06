import React from 'react'
import { Box, Grid, Text } from 'grommet'

import isSearchableQuery from 'helpers/isSearchableQuery'
import api from 'api'

import SearchInput from 'components/SearchInput'
import { SearchResultsLimit } from 'components/SearchResultsLimit'
import { SearchResultsFilters } from 'components/SearchResultsFilters'
import { SearchResultsOffset } from 'components/SearchResultsOffset'
import { SearchResult } from 'components/resources/SearchResult'
import { useSearchResources } from 'hooks/useSearchResources'
import EmptySearch from '../images/empty-search.svg'
import SearchNoResults from '../images/search-no-results.svg'

const Search = ({ search }) => {
  const { response } = useSearchResources(search)
  const hasNoSearch = !response
  const hasNoResults = response && response.count === 0
  const hasResults = response && response.count > 0

  return (
    <>
      <Box pad={{ horizontal: '144px' }} margin={{ bottom: 'xlarge' }}>
        <SearchInput />
      </Box>
      {hasNoSearch && (
        <Box width="full" align="center">
          <Box align="center" width="large">
            <Text
              textAlign="center"
              size="xlarge"
              margin={{ vertical: '90px' }}
            >
              Search the portal for cell lines, plasmids, PDX models, datasets,
              and more!
            </Text>
            <EmptySearch />
          </Box>
        </Box>
      )}
      {hasNoResults && (
        <Box width="full" align="center">
          <Box align="center" width="large">
            <Text textAlign="center" size="xlarge" margin={{ top: '90px' }}>
              No results for term ‘{search.query.search}’.
            </Text>
            <Text textAlign="center" size="xlarge" margin={{ bottom: '90px' }}>
              Try a different term.
            </Text>
            <SearchNoResults />
          </Box>
        </Box>
      )}
      {hasResults && (
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
          <Box gridArea="filters" width="224px">
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
  const props = { pathname, query: searchQuery }

  if (!isSearchableQuery(query)) return { ...props, response: false }

  const apiResponse = await api.search.resources(searchQuery)

  return {
    ...props,
    response: apiResponse.isOk ? apiResponse.response : false
  }
}

export default Search
