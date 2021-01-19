import { object, string, array, boolean } from 'yup'

export const customErrorMessages = {
  contact_user: 'You must select a Contact User for the resource.'
}

export const categories = [
  'CELL_LINE',
  'PLASMID',
  'PROTOCOL',
  'DATASET',
  'MODEL_ORGANISM',
  'PDX',
  'OTHER'
]

export const importSources = [
  'GEO',
  'SRA',
  'DBGAP',
  'DATASET',
  'PROTOCOLS_IO',
  'ADDGENE',
  'JACKSON_LABS',
  'ATCC',
  'ZIRC',
  'OTHER'
]

// Additional metadata when importing a material
const importedCategories = {
  CELL_LINE: object({
    cell_line_name: string().required(),
    tissue: string().required(),
    disease: string().required(),
    number_of_available_cell_lines: string(),
    age: string(),
    sex: string(),
    ethnicity: string(),
    subculturing: string(),
    cryopreservation: string()
  }),
  PLASMID: object({
    plasmid_name: string().required(),
    description: string().required(),
    purpose: string(),
    number_of_available_samples: string(),
    gene_insert_name: string().required(),
    relevant_mutations: string().required(),
    additional_info: string()
  }),
  PROTOCOL: object({
    description: string().required(),
    abstract: string(),
    protocol_name: string()
  }),
  DATASET: object({
    accession_code: string().required(),
    description: string().required().required(),
    number_of_samples: string().required(),
    technology: string(), // required for geo and sra .required(),
    platform: string(), // required for geo and sra .required(),
    additional_info: string()
  }),
  MODEL_ORGANISM: object({
    description: string().required(),
    additional_info: string(),
    // the following are not asked for currently for imports
    genetic_background: string(),
    zygosity: string(),
    number_of_available_models: string(),
    construct_details: string()
  }),
  // this currently can't be imported
  // when it can remove keys which have no inputs
  // mark required when applicable
  PDX: object({
    patient_id: string(),
    gender: string(),
    age: string(),
    diagnosis: string(),
    consent_to_share: boolean(),
    ethnicity: string(),
    treatment_drug: string(),
    treatment_protocol: string(),
    prior_treatment_response: string(),
    response_to_treatment: string(),
    virology_status: string(),
    submitter_tumor_id: string(),
    tissue_of_origin: string(),
    tumor_type: string(),
    specimen_tumor_tissue: string(),
    histology: string(),
    tumor_grade: string(),
    disease_stage: string(),
    specific_markers: string(),
    is_from_untreated_patient: boolean().nullable().required(),
    tumor_sample_type: string(),
    existing_model_explanation: string(),
    pdx_id: string(),
    model_organism: string(),
    model_strain_and_source: string(),
    is_strain_immunized: boolean().nullable().required(),
    type_of_humanization: string(),
    tumor_preparation: string(),
    injection_type_and_site: string(),
    treatment_for_engraftment: string(),
    engraftment_rate: string(),
    engraftment_time: string(),
    tumor_characterization_technology: string(),
    is_not_of_ebv_origin: string(),
    is_passage_qa_performed: boolean().nullable().required(),
    response_to_qa_performed: string(),
    response_to_standard_of_care: string(),
    treatment_passage: string(),
    treatment_response: string(),
    tumor_omics: string(),
    metastases_in_strain: string(),
    lag_time: string(),
    number_of_available_models: string(),
    pdx_model_availability: string(),
    governance_restriction: string()
  }),
  OTHER: object({
    resource_type: string().required(),
    description: string().required()
  })
}

// Additional metadata when listing a material
const listedCategories = {
  CELL_LINE: object({
    cell_line_name: string().required(),
    cell_type: string().required(),
    tissue: string().required(),
    disease: string().required(),
    number_of_available_cell_lines: string(),
    age: string(),
    sex: string(),
    ethnicity: string(),
    biosafety_level: string().required(),
    description: string().required(),
    population_doubling_time: string().required(),
    storage_medium: string().required(),
    growth_medium: string().required(),
    subculturing: string(),
    cryopreservation: string(),
    culture_conditions: string().required(),
    str_profile: string().required(),
    passage_number: string().required()
  }),
  PLASMID: object({
    plasmid_name: string().required(),
    plasmid_type: string().required(),
    purpose: string().required(),
    number_of_available_samples: string(),
    biosafety_level: string().required(),
    gene_insert_name: string().required(),
    relevant_mutations: string().required(),
    backbone_name: string().required(),
    primary_vector_type: string().required(),
    cloning_method: string().required(),
    bacterial_resistance: string().required(),
    copy_number: string().required(),
    growth_temp_celsius: string().required(),
    growth_strain: string().required()
  }),
  PROTOCOL: object({
    protocol_name: string().required(),
    description: string().required(),
    abstract: string().required(),
    additional_info: string()
  }),
  DATASET: object({
    accession_code: string().required(),
    description: string().required(),
    number_of_samples: string().required(),
    technology: string().required(),
    platform: string().required(),
    additional_info: string()
  }),
  MODEL_ORGANISM: object({
    description: string().required(),
    genetic_background: string().required(),
    zygosity: string().required(),
    number_of_available_models: string(),
    construct_details: string().required(),
    additional_info: string()
  }),
  PDX: object({
    patient_id: string().required(),
    gender: string().required(),
    age: string(),
    diagnosis: string().required(),
    consent_to_share: boolean().required(),
    ethnicity: string(),
    treatment_drug: string(),
    current_treatment_protocol: string(),
    treatment_protocol: string(),
    prior_treatment_response: string(),
    virology_status: string().required(),
    submitter_tumor_id: string().required(),
    tissue_of_origin: string().required(),
    tumor_type: string().required(),
    specimen_tumor_tissue: string().required(),
    histology: string().required(),
    tumor_grade: string().required(),
    disease_stage: string().required(),
    specific_markers: string().required(),
    is_from_untreated_patient: boolean().nullable().required(),
    tumor_sample_type: string().required(),
    existing_model_explanation: string().required(),
    pdx_id: string().required(),
    model_organism: string().required(),
    model_strain_and_source: string().required(),
    is_strain_immunized: boolean().nullable().required(),
    type_of_humanization: string().required(),
    tumor_preparation: string().required(),
    injection_type_and_site: string().required(),
    treatment_for_engraftment: string().required(),
    engraftment_rate: string().required(),
    engraftment_time: string().required(),
    tumor_characterization_technology: string().required(),
    is_not_of_ebv_origin: string().required(),
    is_passage_qa_performed: boolean().nullable().required(),
    animal_health_status: string().required(),
    response_to_standard_of_care: string(),
    treatment_passage: string(),
    treatment_response: string(),
    tumor_omics: string(),
    metastases_in_strain: string(),
    lag_time: string(),
    number_of_available_models: string(),
    pdx_model_availability: string(),
    governance_restriction: string()
  }),
  OTHER: object({
    resource_type: string().required(),
    description: string().required()
  })
}

export const defaultSchema = object({
  category: string().oneOf(categories),
  url: string().when('imported', (imported) => {
    if (imported) return string().url().required()
    return string().nullable()
  }),
  pubmed_id: string().max(32),
  additional_metadata: object().when(
    ['imported', 'category'],
    (imported, category) => {
      // this takes the current empty object validation and
      // extends it with the material category specific rules
      if (imported) return importedCategories[category].required()
      return listedCategories[category].required()
    }
  ),
  //  mta_attachment: string
  title: string().when('category', (category) => {
    if (['DATASET', 'OTHER', 'MODEL_ORGANISM'].includes(category))
      return string().required()
    return string()
  }),
  needs_irb: boolean(),
  needs_abstract: boolean(),
  imported: boolean(),
  // shipping_requirements: object()
  import_source: string().when('imported', (imported) => {
    if (imported) return string().oneOf(importSources)
    return string().nullable()
  }),
  contact_user: string().uuid().required(customErrorMessages.contact_user),
  // organization: object(),
  // grants: array(),
  /* eslint-disable-next-line react/forbid-prop-types */
  organisms: array().when('category', (category) => {
    // if it is a dataset and not dbgap then require organisms
    if (
      ['PLASMID', 'MODEL_ORGANISM', 'CELL_LINE', 'DATASET', 'PDX'].includes(
        category
      )
    )
      return array().compact().min(1).required()
    return array().nullable()
  }),
  publication_title: string().nullable(),
  pre_print_doi: string().nullable(),
  pre_print_title: string().nullable(),
  citation: string().nullable(),
  additional_info: string().nullable(),
  embargo_date: string().nullable() // confirm what django expects
  /* eslint-disable-next-line react/forbid-prop-types */
  // sequence_maps: array() // figure out what to set here
})

export const getSchema = ({ imported, category }) => {
  let schema = defaultSchema.clone()

  if (imported) {
    schema = schema.shape({
      url: string().url().required(),
      import_source: string().oneOf(importSources)
    })
  }

  if (category && imported) {
    schema = schema.shape({
      additional_metadata: importedCategories[category].required()
    })
  }

  if (category && !imported) {
    schema = schema.shape({
      additional_metadata: listedCategories[category].required()
    })
  }

  if (['DATASET', 'OTHER', 'MODEL_ORGANISM'].includes(category)) {
    schema = schema.shape({
      title: string().required()
    })
  }

  if (
    ['PLASMID', 'MODEL_ORGANISM', 'CELL_LINE', 'DATASET', 'PDX'].includes(
      category
    )
  ) {
    schema = schema.shape({ organisms: array().compact().min(1).required() })
  }

  if (category === 'PLASMID') {
    schema = schema.shape({ sequence_maps: array().nullable() })
  }

  // shipping_requirements: object()
  return schema
}

export default defaultSchema
