export const searchResult = ['description']

export const details = [
  {
    basic_information: [
      'resource_type',
      'title',
      'description',
      'additional_info'
    ]
  }
]

export const listForm = [
  {
    basic_information: [
      'resource_type',
      'title',
      'description',
      'additional_info'
    ]
  }
]

export const importForm = () => [
  {
    basic_information: [
      'resource_type',
      'url',
      'title',
      'description',
      'additional_info'
    ]
  }
]

export default {
  searchResult,
  details,
  listForm,
  importForm
}
