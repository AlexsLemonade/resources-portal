export const searchResult = ['description']

export const listForm = [
  {
    basic_information: [
      'title',
      'organisms',
      'description',
      'genetic_background',
      'zygosity',
      'number_of_available_models',
      'construct_details',
      'additional_info'
    ]
  }
]

export const importForm = (importSource) => {
  if (['ZIRC', 'JACKSON_LABS'].includes(importSource)) {
    return [
      {
        basic_information: [
          'url',
          'title',
          'organisms',
          'description',
          'additional_info'
        ]
      }
    ]
  }
  return [
    {
      basic_information: [
        'url',
        'title',
        'organisms',
        'description',
        'genetic_background',
        'zygosity',
        'number_of_available_models',
        'construct_details',
        'additional_info'
      ]
    }
  ]
}

export default {
  searchResult,
  listForm,
  importForm
}
