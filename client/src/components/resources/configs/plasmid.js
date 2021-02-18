export const searchResult = [
  'purpose',
  'gene_insert_name',
  'relevant_mutations'
]

export const listForm = [
  {
    basic_information: [
      'plasmid_name',
      'plasmid_type',
      'purpose',
      'organisms',
      'number_of_available_samples',
      'biosafety_level'
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

export const importForm = () => [
  {
    basic_information: [
      'url',
      'plasmid_name',
      'organisms',
      'description',
      'gene_insert_name',
      'relevant_mutations',
      'additional_info'
    ]
  }
]

export default {
  searchResult,
  listForm,
  importForm,
  titleAttribute: 'plasmid_name'
}
