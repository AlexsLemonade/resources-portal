export const searchResult = ['tissue_histology', 'available_quality_fields']

export const details = [
  {
    basic_information: [
      'cell_line_name',
      'organism',
      'tissue',
      'disease',
      'number_of_availible_cell_lines',
      'age',
      'sex',
      'ethnicity',
      'bio_safety_level',
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

export const form = [
  {
    basic_information: [
      'cell_line_name',
      'organism',
      'tissue',
      'disease',
      'number_of_availible_cell_lines',
      'age',
      'sex',
      'ethnicity',
      'bio_safety_level',
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

export default {
  searchResult,
  details,
  form
}
