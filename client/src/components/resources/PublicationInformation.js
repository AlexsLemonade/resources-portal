import React from 'react'
import DetailsTable from '../DetailsTable'

export const PublicationInformation = ({ resource }) => {
  return (
    <DetailsTable
      data={[
        {
          label: 'PubMed ID',
          value: resource.pubmedid
        },
        {
          label: 'Publication Title',
          value: resource.publication_title
        },
        {
          label: 'Pre-print DOI',
          value: resource.pre_print_doi
        },
        {
          label: 'Pre-print Title',
          value: resource.pre_print_title
        },
        { label: 'Citation', value: resource.additional_metadata.citation }
      ]}
    />
  )
}
