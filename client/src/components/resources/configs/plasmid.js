export const searchResult = [
  'purpose',
  'gene_insert_name',
  'relevant_mutations'
]

export const details = [
  {
    basic_information: [
      'plasmid_name',
      'plasmid_type',
      'purpose',
      'organism',
      'number_of_available_samples',
      'bio_safety_level'
    ]
  },
  {
    gene_insert: [
      'gene_insert_name',
      'relevant_mutations',
      'backbone_name',
      'primary_vector_type',
      'cloning_method',
      'sequence_maps'
    ]
  },
  {
    growth_in_bacteria: [
      'bacterial_resistance',
      'copy_number',
      'growth_temp_celsius',
      'growth_strain',
      'additional_info'
    ]
  }
]

export const form = [
  {
    basic_information: [
      'plasmid_name',
      'plasmid_type',
      'purpose',
      'organism',
      'number_of_available_samples',
      'bio_safety_level'
    ]
  },
  {
    gene_insert: [
      'gene_insert_name',
      'relevant_mutations',
      'backbone_name',
      'primary_vector_type',
      'cloning_method',
      'sequence_maps'
    ]
  },
  {
    growth_in_bacteria: [
      'bacterial_resistance',
      'copy_number',
      'growth_temp_celsius',
      'growth_strain',
      'additional_info'
    ]
  }
]

export default {
  searchResult,
  details,
  form
}
