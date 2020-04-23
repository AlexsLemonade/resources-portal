import React from 'react'
import { SearchResult, SearchResultDetail } from '../../components/SearchResult'
import DetailsTable from '../../components/DetailsTable'

export const ProtocolSearchResult = ({ resource }) => {
  const { abstract, description } = resource.additional_metadata
  return (
    <SearchResult resource={resource}>
      {description && (
        <SearchResultDetail title="Description" label={description} />
      )}
      {!description && abstract && (
        <SearchResultDetail title="Abstract" label={abstract} />
      )}
      {!description && !abstract && (
        <SearchResultDetail italic title="Description" label="Not Specified" />
      )}
    </SearchResult>
  )
}

export const ResourceDetails = ({ resource }) => {
  const { abstract, description } = resource.additional_metadata
  const abstractOrDescription = {}

  if (description) {
    abstractOrDescription.label = 'Description'
    abstractOrDescription.value = description
  } else if (abstract) {
    abstractOrDescription.label = 'Abstract'
    abstractOrDescription.value = abstract
  } else {
    abstractOrDescription.label = 'Description'
  }

  return (
    <DetailsTable
      data={[
        {
          label: 'Protocol Name',
          value: resource.additional_metadata.protocol_name
        },
        abstractOrDescription,
        {
          label: 'Additional Information',
          value: resource.additional_metadata.additional_info || 'None'
        }
      ]}
    />
  )
}

export default {
  SearchResult: ProtocolSearchResult,
  ResourceDetails
}
