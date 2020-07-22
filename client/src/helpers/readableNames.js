export const readableNames = {
  ADDGENE: 'Addgene',
  ALL: 'All',
  ATCC: 'ATCC',
  CELL_LINE: 'Cell Line',
  DATASET: 'Dataset',
  DBGAP: 'dbGaP',
  GEO: 'GEO',
  JACKSON_LABS: 'Jax Lab',
  MODEL_ORGANISM: 'Model Organism',
  OTHER: 'Other',
  PDX: 'PDX Model',
  PLASMID: 'Plasmid',
  PROTOCOL: 'Protocol',
  PROTOCOLS_IO: 'protocols.io',
  SRA: 'SRA',
  ZIRC: 'ZIRC',
  available_quality_fields: 'Available Quality Fields',
  abstract: 'Abstract',
  additional_info: 'Additional Information',
  additional_metadata: 'Additional Metadata',
  age: 'Age',
  backbone_name: 'Backbone Names',
  bacterial_resistance: 'Bacterial Resistance',
  bio_safety_level: 'Bio Safety Level',
  biosafety_level: 'Biosafety Level',
  category: 'Resource Type',
  cell_line_name: 'Cell Line Name',
  cloning_method: 'Cloning Method',
  consent_to_share: 'Consent to Share',
  construct_details: 'Construct Details',
  contact_user: 'Contact User',
  copy_number: 'Copy Number',
  created_at: 'Date Created',
  cryopreservation: 'Cryopreservation',
  culture_conditions: 'Culture Conditions',
  description: 'Description',
  diagnosis: 'Diagnosis',
  disease: 'Disease',
  disease_stage: 'Disease Stage',
  embargo_date: 'Embargo Date',
  engraftment_rate: 'Engraftment Rate',
  engraftment_time: 'Engraftment Time',
  ethnicity: 'Ethnicity',
  existing_model_explanation: 'Existing Model Explanation',
  gender: 'Gender',
  gene_insert_name: 'Gene Insert Name',
  genetic_background: 'Genetic Background',
  governance_restriction: 'Governance Restriction',
  growth_medium: 'Growth Medium',
  growth_strain: 'Growth Strain',
  growth_temp_celsius: 'Growth Temp Celsius',
  has_pre_print: 'Has Pre-print',
  has_publication: 'Has Publications',
  tissue_histology: 'Tissue Histology',
  import_source: 'Import Source',
  imported: 'Import',
  injection_type_and_site: 'Injection Type and Site',
  is_from_untreated_patient: 'Is From Untreated Patient',
  is_not_of_ebv_origin: 'Is Not of EBV Origin',
  is_passage_qa_performed: 'Is Passage QA Performed',
  is_strain_immunized: 'Is Strain Immunized',
  lag_time: 'Lag Time',
  metastases_in_strain: 'Metastases in Strain',
  model_organism: 'Model Organism',
  model_strain_and_source: 'Model Strain and Source',
  mta_attachment: 'MTA Attachment',
  needs_irb: 'IRB required',
  needs_mta: 'MTA required',
  number_availible_models: 'Number of Available Models',
  number_of_available_models: 'Number of Available Models',
  number_of_availible_cell_lines: 'Number of Available Cell Lines',
  number_of_available_samples: 'Number of Samples',
  organism: 'Organism',
  organization: 'Organization',
  passage_number: 'Passage Number',
  patient_id: 'Patient ID',
  pdx_id: 'PDX ID',
  pdx_model_availability: 'PDX Model Availability',
  plasmid_name: 'Plasmid Name',
  plasmid_type: 'Plasmid Type',
  platform: 'Platform',
  population_doubling_time: 'Population Doubling Time',
  pre_print_doi: 'Pre-print DOI',
  pre_print_title: 'Pre-print Title',
  primary_vector_type: 'Primary Vector Type',
  prior_treatment_protocol: 'Prior Treatment Protocol',
  protocol_name: 'Protocol Name',
  publication_title: 'Publication Title',
  pubmed_id: 'PubMed ID',
  purpose: 'Purpose',
  relevant_mutations: 'Relevant Mutations',
  response_to_qa_performed: 'Response to QA Performed',
  response_to_standard_of_care: 'Response to Standard of Care',
  response_to_treatment: 'Response to Treatment',
  sequence_maps: 'Sequence Maps',
  sex: 'Sex',
  shipping_requirements: 'Shipping Requirements',
  specific_markers: 'Specific Markers',
  specimen_tumor_tissue: 'Specimen Tumor Tissue',
  storage_medium: 'Storage Medium',
  str_profile: 'STR Profile',
  strain_name: 'Strain Name',
  subculturing: 'Subculturing',
  submitter_tumor_id: 'Submitter Tumor ID',
  technology: 'Technology',
  tissue: 'Tissue',
  tissue_of_origin: 'Tissue of Origin',
  title: 'Title',
  treatment_drug: 'Treatment Drug',
  treatment_for_engraftment: 'Treatment for Engraftment',
  treatment_passage: 'Treatment Passage',
  treatment_protocol: 'Treatment Protocol',
  treatment_response: 'Treatment Response',
  tumor_characterization_technology: 'Tumor Characterization Technology',
  tumor_grade: 'Tumor Grade',
  tumor_preparation: 'Tumor Preparation',
  tumor_properties: 'Tumor Properties',
  tumor_sample_type: 'Tumor Sample Type',
  tumor_type: 'Tumor Type',
  type_of_humanization: 'Type of Humanization',
  updated_at: 'Last Updated',
  url: 'URL',
  virology_status: 'Virology Status',
  zygosity: 'Zygosity',
  basic_information: 'Basic Information',
  culture: 'Culture',
  quality: 'Quality'
}

export const getReadable = (token) => {
  const readableNameMatch = readableNames[token]
  return readableNameMatch || token
}

export const getToken = (readable, fallback) => {
  const readableNameMatch = Object.entries(readableNames).find((pair) =>
    pair.includes(readable)
  )

  return readableNameMatch ? readableNameMatch[0] : fallback
}

export default getReadable
