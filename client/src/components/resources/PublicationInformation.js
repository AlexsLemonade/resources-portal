import React from 'react'
import DetailsTable from '../DetailsTable'

export const PublicationInformation = ({ resource }) => {
  return (
    <DetailsTable
      data={[
        {
          label: 'PubMed ID',
          value: resource.pubmed_id
        },
        {
          label: 'Publication Title',
          value: resource.publication_title
        },
        {
          label: 'Preprint DOI',
          value: resource.pre_print_doi
        },
        {
          label: 'Preprint Title',
          value: resource.pre_print_title
        },
        { label: 'Citation', value: resource.citation }
      ]}
    />
  )
}
