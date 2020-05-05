import React from 'react'
import { Box, Button, Text, Heading, CheckBox } from 'grommet'
import { getReadable } from '../helpers/readableNames'
import { sortedObjectKeysByValues } from '../helpers/sortObjectKeys'
import { useSearchResources } from '../hooks/useSearchResources'

export const SearchResultsFilters = () => {
  const {
    response: { facets },
    toggleFacet,
    clearFacets,
    hasFacet,
    hasAnyFacet,
    goToSearchResults
  } = useSearchResources()
  return (
    <Box>
      <Box direction="row" align="baseline" justify="between">
        <Heading serif margin={{ top: 'none', bottom: 'small' }} level="5">
          Filters
        </Heading>
        <Button
          plain
          label="clear all"
          disabled={!hasAnyFacet()}
          onClick={() => {
            clearFacets()
            goToSearchResults()
          }}
        />
      </Box>
      {facets.category && (
        <Box margin={{ top: 'small' }} pad={{ vertical: 'small' }}>
          <Text weight="bold" margin={{ bottom: 'small' }}>
            Resource Types
          </Text>
          {sortedObjectKeysByValues(facets.category).map((category) => (
            <CheckBox
              key={category.key}
              label={`${getReadable(category.key)} (${category.value})`}
              checked={hasFacet('category', category.key)}
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
              checked={hasFacet('organism', organism.key)}
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
            label={`Includes Publication (${facets.has_publication})`}
            checked={hasFacet('has_publication')}
            onChange={({ target: { checked } }) => {
              toggleFacet(checked, 'has_publication')
              goToSearchResults(true)
            }}
          />
          <CheckBox
            label={`Includes Pre-print (${facets.has_pre_print})`}
            checked={hasFacet('has_pre_print')}
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
