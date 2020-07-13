import React from 'react'
import SearchResultComponent from '../../SearchResult'
import DetailsTable from '../../DetailsTable'

export const SearchResult = SearchResultComponent

export const ResourceDetails = ({ resource }) => {
  return (
    <DetailsTable
      data={[
        { label: 'Title', value: resource.title },
        {
          label: 'Description',
          value: resource.additional_metadata.description
        },
        { label: 'Organism', value: resource.additional_metadata.organism },
        {
          label: 'Number of Samples',
          value: resource.additional_metadata.number_samples
        },
        { label: 'Technology', value: resource.additional_metadata.technology },
        { label: 'Platform', value: resource.additional_metadata.platform },
        {
          label: 'Additional Information',
          value: resource.additional_metadata.additional_info || 'None'
        }
      ]}
    />
  )
}

export default {
  SearchResult,
  ResourceDetails
}