import { getPubmedUrl } from 'helpers/getPubmedUrl'
import { getDOIUrl } from 'helpers/getDOIUrl'
import { knownOrganisms } from 'helpers/knownOrganisms'
import {
  categories as resourceCategories,
  importSources
} from 'schemas/material'

export { resourceCategories }
export { importSources }

export const supportedImportSources = ['SRA', 'GEO', 'PROTOCOLS_IO']

export const importAttributes = {
  SRA: 'accession_code',
  GEO: 'accession_code',
  PROTOCOLS_IO: 'protocol_doi'
}

export const importSourceCategories = {
  GEO: 'DATASET',
  SRA: 'DATASET',
  DBGAP: 'DATASET',
  ATCC: 'CELL_LINE',
  ADDGENE: 'PLASMID',
  PROTOCOLS_IO: 'PROTOCOL',
  JACKSON_LABS: 'MODEL_ORGANISM',
  ZIRC: 'MODEL_ORGANISM',
  OTHER: 'OTHER'
}

export const autoCompleteOptions = {
  organisms: knownOrganisms,
  model_organism: knownOrganisms
}

export const shippingAttributes = [
  'needs_shipping_address',
  'needs_payment',
  'accepts_shipping_code',
  'accepts_reimbursement',
  'accepts_other_payment_methods',
  'sharer_pays_shipping',
  'restrictions'
]

export const attributeInputTypes = {
  organisms: 'list',
  abstract: 'textarea',
  additional_info: 'textarea',
  citation: 'textarea',
  description: 'textarea',
  construct_details: 'textarea',
  storage_medium: 'textarea',
  subculturing: 'textarea',
  growth_medium: 'textarea',
  cryopreservation: 'textarea',
  culture_conditions: 'textarea',
  str_profile: 'textarea',
  sequence_maps: 'sequencemaps',
  plasmid_type: 'select',
  primary_vector_type: 'select',
  cloning_method: 'select',
  biosafety_level: 'biosafety_level',
  copy_number: 'select',
  zygosity: 'select',
  bacterial_resistance: 'multiselect',
  growth_temp_celsius: 'float',
  number_of_samples: 'integer',
  contact_user: 'contactuser',
  is_passage_qa_performed: 'boolean',
  is_strain_immunized: 'boolean',
  is_from_untreated_patient: 'boolean',
  is_strain_humanized: 'boolean',
  consent_to_share: 'boolean'
}

// Some Input Types need a lot more data
// Other will be a special case where we show a text field or text area
export const attributeOptions = {
  plasmid_type: ['Encodes one insert', 'Encodes gRNA/shRNA', 'Empty backbone'],
  primary_vector_type: [
    'Mammalian Expression',
    'Bacterial Expression',
    'Lentiviral',
    'Retroviral',
    'Adenoviral',
    'AAV',
    'RNAi',
    'Luciferase',
    'Cre/Lox',
    'Yeast Expression',
    'Worm Expression',
    'Insect Expression',
    'Plant Expression',
    'Mouse Targeting',
    'CRISPR',
    'TALEN',
    'Synthetic Biology',
    'Unspecified',
    'Other'
  ],
  cloning_method: [
    'Restriction Enzyme',
    'TOPO Cloning',
    'Gateway Cloning',
    'Ligation Independent Cloning',
    'Gibson Cloning',
    'Unknown'
  ],
  biosafety_level: [
    'Biosafety Level 1',
    'Biosafety Level 2',
    'Biosafety Level 3'
  ],
  bacterial_resistance: [
    'Nourseothricin(clonNat)',
    'Ampicillin and Bleocin (Zeocin)',
    'Ampicillin and Kanamycin',
    'Ampicillin and Tetracycline',
    'Ampicillin and Streptomycin',
    'Ampicillin and Spectinomycin',
    'Chloramphenicol and Ampicillin',
    'Chloramphenicol and Bleocin (Zeocin)',
    'Chloramphenicol and Tetracycline',
    'Chloramphenicol and Kanamycin',
    'Chloramphenicol and Spectinomycin',
    'Chloramphenicol and Gentamycin',
    'Spectinomycin and Streptomycin',
    'Other'
  ],
  copy_number: ['High Copy', 'Low Copy', 'Unknown'],
  zygosity: ['Hetrozygous', 'Homozygous'],
  conset_to_share: ['Yes', 'No']
}

export const attributes = [
  'grants', // this is posted to /grants/id/material {material_id: xxx}
  'sequence_maps',
  'category',
  'url',
  'pubmed_id',
  'additional_metadata',
  'mta_attachment',
  'title',
  'needs_irb',
  'needs_abstract',
  'imported',
  'shipping_requirement',
  'import_source',
  'contact_user',
  'organization',
  'organisms',
  'publication_title',
  'pre_print_doi',
  'pre_print_title',
  'citation',
  'additional_info',
  'embargo_date',
  'is_archived'
]

export const formDefaults = [
  {
    contact_user: ['contact_user']
  },
  {
    publication_information: [
      'pubmed_id',
      'publication_title',
      'pre_print_doi',
      'pre_print_title',
      'citation'
    ]
  }
]

export const mustExistAtEndpoints = {
  pubmed_id: getPubmedUrl,
  pre_print_doi: getDOIUrl
}

// helper functions
export const disableImportAttribute = (attribute, importAttribute) => {
  return importAttribute
    ? attribute === importAttribute || attribute === 'url'
    : false
}

export const isMetadataAttribute = (attribute) => {
  return !attributes.includes(attribute)
}

export const isShippingAttribute = (attribute) => {
  return shippingAttributes.includes(attribute)
}

export const getInputType = (attribute) => {
  return attributeInputTypes[attribute] || 'textinput'
}

export const getInputOptions = (attribute) => {
  return attributeOptions[attribute] || ['Other']
}

export const getIsOptional = (optionalAttributes, attribute) => {
  return optionalAttributes.includes(attribute)
}

export const getImportAttribute = (importSource) => {
  return importAttributes[importSource]
}

export const getAutoCompleteOptions = (attribute, inputValue = '') => {
  // don't suggest on open
  if (inputValue.length === 0) return []
  const allOptions = autoCompleteOptions[attribute] || []
  // no suggestions no need to continue
  if (allOptions.length === 0) return []

  // exact match don't suggest anything
  if (allOptions.includes(inputValue)) return []

  // return the first 10 that match the same input characters
  return allOptions
    .filter((option) =>
      option.toLowerCase().startsWith(inputValue.toLowerCase())
    )
    .slice(0, 10)
}

export const isSupportedImportSource = (importSource) => {
  return supportedImportSources.includes(importSource)
}

export const getImportSourceCategory = (importSource) => {
  return importSourceCategories[importSource]
}

export const getMustExistAt = (attribute) => {
  return mustExistAtEndpoints[attribute]
}
