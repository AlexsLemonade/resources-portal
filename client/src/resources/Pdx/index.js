import React from 'react'
import { SearchResult, SearchResultDetail } from '../../components/SearchResult'
import DetailsTable from '../../components/DetailsTable'
import { HeaderRow } from '../../components/HeaderRow'

export const PDXSearchResult = ({ resource }) => {
  return (
    <SearchResult resource={resource}>
      <SearchResultDetail
        title="Tissue Histology"
        label={resource.additional_metadata.histology}
      />
      <SearchResultDetail
        title="Primary Tumor Tissue of Origin"
        label={resource.additional_metadata.tissue_of_origin}
      />
      <SearchResultDetail
        title="Tumor Type"
        label={resource.additional_metadata.tumor_type}
      />
    </SearchResult>
  )
}

export const ResourceDetails = ({ resource }) => {
  return (
    <>
      <HeaderRow label="Clinical/Patient Information" />
      <DetailsTable
        data={[
          {
            label: 'Submitter Patient ID',
            value: resource.additional_metadata.patient_id
          },
          { label: 'Organism', value: resource.additional_metadata.organism },
          { label: 'Gender', value: resource.additional_metadata.gender },
          { label: 'Age', value: resource.additional_metadata.age },
          { label: 'Diagnosis', value: resource.additional_metadata.diagnosis },
          {
            label: 'Consent to Share',
            value: resource.additional_metadata.consent_to_share ? 'Yes' : 'No'
          },
          { label: 'Ethnicity', value: resource.additional_metadata.ethnicity },
          {
            label: 'Current Treatment Drug',
            value: resource.additional_metadata.treatment_drug
          },
          {
            label: 'Current Treatment Protocol',
            value: resource.additional_metadata.treatment_protocol
          },
          {
            label: 'Prior Treatment Protocol',
            value: resource.additional_metadata.prior_treatment_protocol
          },
          {
            label: 'Response to Prior Treatment',
            value: resource.additional_metadata.response_to_treatment
          },
          {
            label: 'Virology Status',
            value: resource.additional_metadata.virology_status
          }
        ]}
      />
      <HeaderRow label="Clinical/Tumor Information" />
      <DetailsTable
        data={[
          {
            label: 'Submitter Tumor ID',
            value: resource.additional_metadata.submitter_tumor_id
          },
          {
            label: 'Primary Tissue of Origin',
            value: resource.additional_metadata.tissue_of_origin
          },
          {
            label: 'Tumor Type',
            value: resource.additional_metadata.tumor_type
          },
          {
            label: 'Speciment Tumor Tissue',
            value: resource.additional_metadata.speciment_tumor_tissue
          },
          {
            label: 'Tissue Histology',
            value: resource.additional_metadata.histology
          },
          {
            label: 'Tumor Grade; classification',
            value: resource.additional_metadata.tumor_grade
          },
          {
            label: 'Disease Stage: classification',
            value: resource.additional_metadata.disease_stage
          },
          {
            label: 'Specific Markers (diagnostically linked); platform',
            value: resource.additional_metadata.specific_markers
          },
          {
            label: 'Is tumor from untreated patient?',
            value: resource.additional_metadata.is_from_untreated_patient
          },
          {
            label: 'Original Tumor sample type',
            value: resource.additional_metadata.tumor_sample_type
          },
          {
            label: 'Tumor from an existing PDX Model? Why sub-line?',
            value: resource.additional_metadata.existing_model_explanation
          }
        ]}
      />
      <HeaderRow label="Model Creation" />
      <DetailsTable
        data={[
          {
            label: 'Submitter PDX ID',
            value: resource.additional_metadata.pdx_id
          },
          {
            label: 'Model Organism',
            value: resource.additional_metadata.model_organism
          },
          {
            label: 'Model Strain and Source',
            value: resource.additional_metadata.model_strain_and_source
          },
          {
            label: 'Strain immune system humanized?',
            value: resource.additional_metadata.is_strain_immunized
          },
          {
            label: 'Type of Humanization',
            value: resource.additional_metadata.type_of_humanization
          },
          {
            label: 'Tumor Preparation',
            value: resource.additional_metadata.tumor_preparation
          },
          {
            label: 'Injection Type and Site',
            value: resource.additional_metadata.injection_type_and_site
          },
          {
            label: 'Organism Treatment for Engraftment',
            value: resource.additional_metadata.treatment_for_engraftment
          },
          {
            label: 'Engraftment Rate',
            value: resource.additional_metadata.engraftment_rate
          },
          {
            label: 'Engraftment Time',
            value: resource.additional_metadata.engraftment_time
          }
        ]}
      />
      <HeaderRow label="Model Quality Assurance" />
      <DetailsTable
        data={[
          {
            label: 'Tumor Characterization Technology',
            value: resource.additional_metadata.tumor_chracterization_technology
          },
          {
            label: 'Tumor confirmed not to be of host organism/EBV origin',
            value: resource.additional_metadata.is_not_of_EBV_origin
          },
          {
            label: 'Passage QA Performed',
            value: resource.additional_metadata.is_passage_QA_performed
          },
          {
            label: 'Response to Standard of Care',
            value: resource.additional_metadata.response_to_QA_performed
          },
          {
            label: 'Animal Health Status',
            value: resource.additional_metadata.response_to_standard_of_care
          }
        ]}
      />
      <HeaderRow label="Model Study" />
      <DetailsTable
        data={[
          {
            label: 'Treatment, passage',
            value: resource.additional_metadata.treatment_passage
          },
          {
            label: 'Treatment Protocol',
            value: resource.additional_metadata.treatment_protocol
          },
          {
            label: 'Treatment Response',
            value: resource.additional_metadata.treatment_response
          },
          {
            label: 'Tumor OMICS',
            value: resource.additional_metadata.tumor_omics
          },
          {
            label: 'Development of metastases in strain',
            value: resource.additional_metadata.matastases_in_strain
          },
          {
            label: 'Lag Time/ Doubling Time of Tumor',
            value: resource.additional_metadata.lag_time
          }
        ]}
      />
      <HeaderRow label="Associated Metadata" />
      <DetailsTable
        data={[
          {
            label: 'Number of Available Models',
            value: resource.additional_metadata.number_availible_models
          },
          {
            label: 'PDX Model Availability',
            value: resource.additional_metadata.pdx_model_availability
          },
          {
            label: 'Governance Restriction for Distribution',
            value: resource.additional_metadata.governance_restriction
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
  SearchResult: PDXSearchResult,
  ResourceDetails
}
