import React from 'react'
import { SearchResult, SearchResultDetail } from '../../components/SearchResult'
import DetailsTable from '../../components/DetailsTable'

export const ModelOrganismSearchResult = ({ resource }) => {
  return (
    <SearchResult resource={resource}>
      <SearchResultDetail
        title="Description"
        label={resource.additional_metadata.description}
      />
    </SearchResult>
  )
}

export const ResourceDetails = ({ resource }) => {
  return (
    <DetailsTable
      data={[
        { label: 'Strain Name', value: resource.title },
        { label: 'Organism', value: resource.additional_metadata.organism },
        {
          label: 'Descriptio',
          value: resource.additional_metadata.description
        },
        {
          label: 'Genetic Background',
          value: resource.additional_metadata.genetic_background
        },
        { label: 'Zygosity', value: resource.additional_metadata.zygostity },
        {
          label: 'Number of Available Models',
          value: resource.additional_metadata.number_of_available_models
        },
        {
          label: 'Construct Details',
          value: resource.additional_metadata.construct_details
        },
        {
          label: 'Additional Information',
          value: resource.additional_metadata.additional_info || 'None'
        }
      ]}
    />
  )
}

export default {
  SearchResult: ModelOrganismSearchResult,
  ResourceDetails
}
