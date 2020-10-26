export const searchResult = ['description_or_abstract']

export const details = [
  {
    basic_information: [
      'protocol_name',
      'description_or_abstract',
      'additional_info'
    ]
  }
]

export const listForm = [
  {
    basic_information: [
      'protocol_name',
      'description',
      'abstract',
      'additional_info'
    ]
  }
]

export const importForm = () => [
  {
    basic_information: [
      'protocol_name',
      'description',
      'abstract',
      'additional_info',
      'url'
    ]
  }
]

export default {
  searchResult,
  details,
  listForm,
  importForm,
  titleAttribute: 'protocol_name'
}
