export const searchResult = [
  'tissue_histology',
  'tissue_of_origin',
  'tumor_type'
]

export const details = [
  {
    clinical_patient_information: [
      'patient_id',
      'organisms',
      'gender',
      'age',
      'diagnosis',
      'consent_to_share',
      'ethnicity',
      'treatment_drug',
      'current_treatment_protocol',
      'prior_treatment_response',
      'virology_status'
    ]
  },
  {
    clinical_tumor_information: [
      'submitter_tumor_id',
      'tissue_of_origin',
      'tumor_type',
      'specimen_tumor_tissue',
      'tissue_histology',
      'tumor_grade',
      'disease_stage',
      'specific_markers',
      'is_from_untreated_patient',
      'tumor_sample_type',
      'existing_model_explanation'
    ]
  },
  {
    model_creation: [
      'pdx_id',
      'model_organism',
      'model_strain_and_source',
      'is_strain_immunized',
      'type_of_humanization',
      'tumor_preparation',
      'injection_type_and_site',
      'treatment_for_engraftment',
      'engraftment_rate',
      'engraftment_time'
    ]
  },
  {
    model_quality_assurance: [
      'tumor_characterization_technology',
      'is_not_of_ebv_origin',
      'is_passage_qa_performed',
      'response_to_standard_of_care',
      'animal_health_status'
    ]
  },
  {
    model_study: [
      'treatment_passage',
      'treatment_protocol',
      'treatment_response',
      'tumor_omics',
      'metastases_in_strain',
      'lag_time'
    ]
  },
  {
    associated_metadata: [
      'number_availible_models',
      'pdx_model_availability',
      'governance_restriction',
      'additional_info'
    ]
  }
]

export const listForm = [
  {
    clinical_patient_information: [
      'patient_id',
      'organisms',
      'gender',
      'age',
      'diagnosis',
      'consent_to_share',
      'ethnicity',
      'treatment_drug',
      'current_treatment_protocol',
      'prior_treatment_response',
      'virology_status'
    ]
  },
  {
    clinical_tumor_information: [
      'submitter_tumor_id',
      'tissue_of_origin',
      'tumor_type',
      'specimen_tumor_tissue',
      'tissue_histology',
      'tumor_grade',
      'disease_stage',
      'specific_markers',
      'is_from_untreated_patient',
      'tumor_sample_type',
      'existing_model_explanation'
    ]
  },
  {
    model_creation: [
      'pdx_id',
      'model_organism',
      'model_strain_and_source',
      'is_strain_immunized',
      'type_of_humanization',
      'tumor_preparation',
      'injection_type_and_site',
      'treatment_for_engraftment',
      'engraftment_rate',
      'engraftment_time'
    ]
  },
  {
    model_quality_assurance: [
      'tumor_characterization_technology',
      'is_not_of_ebv_origin',
      'is_passage_qa_performed',
      'animal_health_status',
      'response_to_standard_of_care'
    ]
  },
  {
    model_study: [
      'treatment_passage',
      'treatment_protocol',
      'treatment_response',
      'tumor_omics',
      'metastases_in_strain',
      'lag_time'
    ]
  },
  {
    associated_metadata: [
      'number_availible_models',
      'pdx_model_availability',
      'governance_restriction',
      'additional_info'
    ]
  }
]

// we do not support PDX imports
const importForm = () => {}

export default {
  searchResult,
  details,
  listForm,
  importForm,
  titleAttribute: 'pdx_id'
}
