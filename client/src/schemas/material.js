import { object, string, array, boolean } from 'yup'

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

const materialCategories = {
  CELL_LINE: object({
    cell_line_name: string(),
    tissue: string(),
    disease: string(),
    number_of_availible_cell_lines: string(),
    age: string(),
    sex: string(),
    ethnicity: string(),
    bio_safety_level: string(),
    population_doubling_time: string(),
    storage_medium: string(),
    growth_medium: string(),
    subculturing: string(),
    cryopreservation: string(),
    culture_condition: string()
  }),
  PLASMID: object({
    plasmid_name: string(),
    plasmid_type: string(),
    purpose: string(),
    number_of_available_samples: string(),
    bio_safety_leve: string(),
    gene_insert_name: string(),
    relevant_mutations: string(),
    backbone_name: string(),
    primary_vector_type: string(),
    cloning_method: string(),
    bacterial_resistance: string(),
    copy_number: string(),
    growth_temp_celsius: string(),
    growth_strain: string()
  }),
  PROTOCOL: object({
    description: string(),
    abstract: string(),
    protocol_name: string()
  }),
  DATASET: object({
    description: string(),
    number_samples: string(),
    technology: string(),
    platform: string()
  }),
  MODEL_ORGANISM: object({
    description: string(),
    genetic_background: string(),
    zygostity: string(),
    number_of_available_models: string(),
    construct_details: string()
  }),
  PDX: object({
    patient_id: string(),
    gender: string(),
    age: string(),
    diagnosis: string(),
    consent_to_share: string(),
    ethnicity: string(),
    treatment_drug: string(),
    treatment_protocol: string(),
    prior_treatment_protocol: string(),
    response_to_treatment: string(),
    virology_statu: string(),
    submitter_tumor_id: string(),
    tissue_of_origin: string(),
    tumor_type: string(),
    specimen_tumor_tissue: string(),
    histology: string(),
    tumor_grade: string(),
    disease_stage: string(),
    specific_markers: string(),
    is_from_untreated_patient: string(),
    tumor_sample_type: string(),
    existing_model_explanatio: string(),
    pdx_id: string(),
    model_organism: string(),
    model_strain_and_source: string(),
    is_strain_immunized: string(),
    type_of_humanization: string(),
    tumor_preparation: string(),
    injection_type_and_site: string(),
    treatment_for_engraftment: string(),
    engraftment_rate: string(),
    engraftment_tim: string(),
    tumor_chracterization_technology: string(),
    is_not_of_EBV_origin: string(),
    is_passage_QA_performed: string(),
    response_to_QA_performed: string(),
    response_to_standard_of_car: string(),
    treatment_passage: string(),
    treatment_response: string(),
    tumor_omics: string(),
    matastases_in_strain: string(),
    lag_tim: string(),
    number_availible_models: string(),
    pdx_model_availability: string(),
    governance_restriction: string()
  }),
  OTHER: object({
    description: string()
  })
}

export const material = object({
  category: string().oneOf(categories),
  url: string().url(),
  pubmed_id: string().max(32),
  additional_metadata: object().when('category', (category, schema) =>
    // this takes the current empty object validation and
    // extends it with the material category specific rules
    schema.shape(materialCategories[category])
  ),
  //  mta_attachment: string
  title: string(),
  needs_irb: boolean(),
  needs_abstract: boolean(),
  imported: boolean(),
  // shipping_requirements: object()
  import_source: string().oneOf(importSources),
  // contact_user: object(),
  // organization: object(),
  // grants: array(),
  organism: array(),
  publication_title: string(),
  pre_print_doi: string(),
  pre_print_title: string(),
  citation: string(),
  additional_info: string(),
  embargo_date: string() // confirm what django expects
  // sequence_maps: object() // not available on API yet
})
