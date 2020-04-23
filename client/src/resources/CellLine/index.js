import React from 'react'
import { SearchResult, SearchResultDetail } from '../../components/SearchResult'
import DetailsTable from '../../components/DetailsTable'
import { HeaderRow } from '../../components/HeaderRow'

// TODO:: update meta data to relect new attributes
export const CellLineSearchResult = ({ resource }) => {
  const availableQualityFields = []

  if (resource.additional_metadata.str)
    availableQualityFields.push('STR profile')
  if (resource.additional_metadata.passage_number)
    availableQualityFields.push('Passage')

  return (
    <SearchResult resource={resource}>
      <SearchResultDetail
        title="Tissue Histology"
        label={resource.additional_metadata.tissue}
      />
      <SearchResultDetail
        title="Available Quality Fields"
        label={
          availableQualityFields.length
            ? availableQualityFields.join(', ')
            : 'None'
        }
      />
    </SearchResult>
  )
}

export const ResourceDetails = ({ resource }) => {
  return (
    <>
      <HeaderRow label="Basic Information" />
      <DetailsTable
        data={[
          {
            label: 'Cell Line Name',
            value: resource.additional_metadata.cell_line_name
          },
          {
            label: 'Organism',
            value: resource.additional_metadata.organism
          },
          {
            label: 'Tissue Histology',
            value: resource.additional_metadata.tissue
          },
          {
            label: 'Disease',
            value: resource.additional_metadata.disease
          },
          {
            label: 'Number of Available Cells',
            value: resource.additional_metadata.number_of_availible_cell_lines
          },
          { label: 'Age', value: resource.additional_metadata.age },
          {
            label: 'Sex',
            value: resource.additional_metadata.sex
          },
          {
            label: 'Ethnicity',
            value: resource.additional_metadata.ethnicity
          },
          {
            label: 'Bio Safety Level',
            value: resource.additional_metadata.bio_safety_level
          },
          {
            label: 'Population Doubling Time',
            value: resource.additional_metadata.population_doubling_time
          }
        ]}
      />
      <HeaderRow label="Culture" />
      <DetailsTable
        data={[
          {
            label: 'Storage Medium',
            value: resource.additional_metadata.storage_medium
          },
          {
            label: 'Growth Medium',
            value: resource.additional_metadata.growth_medium
          },
          {
            label: 'Subculturing',
            value: resource.additional_metadata.subculturing
          },
          {
            label: 'Cryopreservation',
            value: resource.additional_metadata.Cryopreservation
          },
          {
            label: 'Culture Conditions',
            value: resource.additional_metadata.culture_conditions
          }
        ]}
      />
      <HeaderRow label="Quality" />
      <DetailsTable
        data={[
          { label: 'STR Profile', value: resource.additional_metadata.str },
          { label: 'Passage Number', value: resource.passsage_number },
          {
            label: 'Additional Information',
            value: resource.additional_metadata.description
          }
        ]}
      />
    </>
  )
}

export default {
  SearchResult: CellLineSearchResult,
  ResourceDetails
}
