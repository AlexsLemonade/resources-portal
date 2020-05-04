import React from 'react'
import { Box, Text, Heading, CheckBox } from 'grommet'
import { getReadable } from '../helpers/readableNames'
import { sortedObjectKeysByValues } from '../helpers/sortObjectKeys'
import { useSearchResources } from '../hooks/useSearchResources'

const isChecked = (queryFacets, facet) => {
  return Array.isArray(queryFacets)
    ? queryFacets.includes(facet)
    : queryFacets === facet
}

export const SearchResultsFilters = () => {
  const {
    query,
    response: { facets },
    toggleFacet,
    goToSearchResults
  } = useSearchResources()
  return (
    <Box>
      <Heading serif margin={{ top: 'none', bottom: 'small' }} level="5">
        Filters
      </Heading>
      {facets.category && (
        <Box margin={{ top: 'small' }} pad={{ vertical: 'small' }}>
          <Text weight="bold" margin={{ bottom: 'small' }}>
            Resource Types
          </Text>
          {sortedObjectKeysByValues(facets.category).map((category) => (
            <CheckBox
              key={category.key}
              label={`${getReadable(category.key)} (${category.value})`}
              checked={isChecked(query.category, category.key)}
              onChange={({ target: { checked } }) => {
                toggleFacet(checked, 'category', category.key)
                goToSearchResults(true)
              }}
            />
          ))}
        </Box>
      )}
      {facets.organism && (
        <Box
          margin={{ top: 'small' }}
          pad={{ vertical: 'small' }}
          border={{
            side: 'top',
            size: 'small',
            color: 'black-tint-95'
          }}
        >
          <Text weight="bold" margin={{ bottom: 'small' }}>
            Organisms
          </Text>
          {sortedObjectKeysByValues(facets.organism).map((organism) => (
            <CheckBox
              key={organism.key}
              label={`${organism.key} (${organism.value})`}
              checked={isChecked(query.organism, organism.key)}
              onChange={({ target: { checked } }) => {
                toggleFacet(checked, 'organism', organism.key)
                goToSearchResults(true)
              }}
            />
          ))}
        </Box>
      )}
      {facets.category && (
        <Box
          margin={{ top: 'small' }}
          pad={{ vertical: 'small' }}
          border={{
            side: 'top',
            size: 'small',
            color: 'black-tint-95'
          }}
        >
          <Text weight="bold" margin={{ bottom: 'small' }}>
            Publication Information
          </Text>
          <CheckBox
            label={`Has publication (${facets.has_publication})`}
            checked={query.has_publication || false}
            onChange={({ target: { checked } }) => {
              toggleFacet(checked, 'has_publication')
              goToSearchResults(true)
            }}
          />
          <CheckBox
            label={`Has pre print (${facets.has_pre_print})`}
            checked={query.has_pre_print || false}
            onChange={({ target: { checked } }) => {
              toggleFacet(checked, 'has_pre_print')
              goToSearchResults(true)
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default SearchResultsFilters
