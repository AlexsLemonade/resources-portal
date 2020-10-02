export const searchResult = ['tissue_histology', 'available_quality_fields']

export const details = [
  {
    basic_information: [
      'cell_line_name',
      'organisms',
      'tissue',
      'disease',
      'number_of_availible_cell_lines',
      'age',
      'sex',
      'ethnicity',
      'biosafety_level',
      'population_doubling_time'
    ]
  },
  {
    culture: [
      'storage_medium',
      'growth_medium',
      'subculturing',
      'cryopreservation',
      'culture_conditions'
    ]
  },
  {
    quality: ['str_profile', 'passage_number', 'description']
  }
]

export const listForm = [
  {
    basic_information: [
      'cell_line_name',
      'organisms',
      'tissue',
      'disease',
      'number_of_availible_cell_lines',
      'age',
      'sex',
      'ethnicity',
      'biosafety_level',
      'population_doubling_time'
    ]
  },
  {
    culture: [
      'storage_medium',
      'growth_medium',
      'subculturing',
      'cryopreservation',
      'culture_conditions'
    ]
  },
  {
    quality: ['str_profile', 'passage_number', 'description']
  }
]

export const importForm = () => [
  {
    basic_information: [
      'url',
      'cell_line_name',
      'organisms',
      'tissue',
      'disease',
      'number_of_availible_cell_lines',
      'age',
      'sex',
      'ethnicity',
      'additional_info'
    ]
  }
]

export default {
  searchResult,
  details,
  listForm,
  importForm,
  titleAttribute: 'cell_line_name'
}
