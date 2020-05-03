import React from 'react'
import { Anchor } from 'grommet'
import { SearchResult, SearchResultDetail } from '../../SearchResult'
import DetailsTable from '../../DetailsTable'
import { HeaderRow } from '../../HeaderRow'

export const PlasmidSearchResult = ({ resource }) => {
  return (
    <SearchResult resource={resource}>
      <SearchResultDetail
        title="Purpose"
        label={resource.additional_metadata.purpose || 'None'}
      />
      <SearchResultDetail
        title="Gene/Insert Name"
        italic={!resource.additional_metadata.gene_insert_name}
        label={resource.additional_metadata.gene_insert_name || 'Not Specified'}
      />
      <SearchResultDetail
        title="Relevant Mutations"
        label={resource.additional_metadata.relevant_mutations}
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
            label: 'Plasmid Name',
            value: resource.additional_metadata.plasmid_name
          },
          {
            label: 'Plasmid Type',
            value: resource.additional_metadata.plasmid_type
          },
          { label: 'Purpose', value: resource.additional_metadata.purpose },
          { label: 'Organism', value: resource.additional_metadata.organism },
          {
            label: 'Number of Samples',
            value: resource.additional_metadata.number_of_available_samples
          },
          {
            label: 'Biosafety Level',
            value: resource.additional_metadata.bio_safety_level
          }
        ]}
      />
      <HeaderRow label="Gene/ Insert" />
      <DetailsTable
        data={[
          {
            label: 'Gene/ Insert Name',
            value: resource.additional_metadata.gene_insert_name
          },
          {
            label: 'Relevant Mutations',
            value: resource.additional_metadata.relevant_mutations
          },
          {
            label: 'Backbone Name',
            value: resource.additional_metadata.backbone_name
          },
          {
            label: 'Primary Vector Type',
            value: resource.additional_metadata.primary_vector_type
          },
          { label: 'Cloning Method', value: resource.cloning_method },
          {
            label: 'Sequence Maps',
            value: (
              <>
                {resource.additional_metadata.sequence_maps &&
                  resource.additional_metadata.sequence_maps.map((map) => (
                    <Anchor target="_blank" href={map.map_url}>
                      <img src="//place-puppy.com/109x109" alt={map.sequence} />
                    </Anchor>
                  ))}
              </>
            )
          }
        ]}
      />
      <HeaderRow label="Growth in Bacteria" />
      <DetailsTable
        data={[
          {
            label: 'Bacterial Resistance',
            value: resource.additional_metadata.bacterial_resistance
          },
          {
            label: 'Copy Number',
            value: resource.additional_metadata.copy_number
          },
          {
            label: 'Growth Temperature (°C)',
            value: resource.additional_metadata.growth_temp_celsius
          },
          {
            label: 'Growth Strain',
            value: resource.additional_metadata.growth_strain
          },
          {
            label: 'Additional Information',
            value: resource.additional_metadata.additional_info
          }
        ]}
      />
    </>
  )
}

export default {
  SearchResult: PlasmidSearchResult,
  ResourceDetails
}
