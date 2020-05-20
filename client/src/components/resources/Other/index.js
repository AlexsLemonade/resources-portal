import React from 'react'
import { SearchResult, SearchResultDetail } from '../../SearchResult'
import DetailsTable from '../../DetailsTable'

export const OtherSearchResult = ({ resource }) => {
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
        { label: 'Title/Resource Name', value: resource.title },
        {
          label: 'Description',
          value: resource.additional_metadata.description
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
  SearchResult,
  ResourceDetails
}
