export const attributeInputType = {
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
  str_profile: 'textarea'
}

export const getInputType = (attribute) => {
  return attributeInputType[attribute] || 'textinput'
}
