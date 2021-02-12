export const searchResult = ['description_or_abstract']

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
  listForm,
  importForm,
  titleAttribute: 'protocol_name'
}
