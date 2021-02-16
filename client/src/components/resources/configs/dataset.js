export const searchResult = ['accession_code', 'description']

export const listForm = [
  {
    basic_information: [
      'title',
      'accession_code',
      'description',
      'organisms',
      'number_of_samples',
      'technology',
      'platform',
      'additional_info'
    ]
  }
]

export const importForm = (importSource) => {
  if (importSource === 'DBGAP') {
    return [
      {
        basic_information: [
          'title',
          'accession_code',
          'url',
          'description',
          'organisms',
          'number_of_samples',
          'additional_info'
        ]
      }
    ]
  }
  return [
    {
      basic_information: [
        'title',
        'accession_code',
        'url',
        'description',
        'organisms',
        'number_of_samples',
        'technology',
        'platform',
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
