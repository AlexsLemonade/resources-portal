import { getReadable } from './readableNames'

const customResourceData = {
  description_or_abstract: (resource) => {
    if (resource.description && resource.description.length > 0)
      return getResourceData(resource, 'description')
    if (resource.abstract && resource.abstract.length > 0)
      return getResourceData(resource, 'abstract')
    return getResourceData(resource, 'description')
  },
  available_quality_fields: (resource, token) => {
    const data = { token, label: getReadable(token), value: [] }
    const qualityFieldTokens = ['str_profile', 'passage_number']
    qualityFieldTokens.forEach((qft) => {
      if (resource.additional_metadata[qft]) data.value.push(getReadable(qft))
    })
    if (data.value.length === 0) data.value = undefined
    return data
  }
}

export const getResourceData = (resource, token) => {
  if (token in customResourceData) {
    return customResourceData[token](resource, token)
  }

  const value = resource[token] || resource.additional_metadata[token]
  const otherValue = resource.additional_metadata[`${token}_other`]

  // join the values unless the value is "Other"
  const joinOther = Array.isArray(value)
    ? [...value, otherValue]
    : `${value !== 'Other' ? value : ''} ${otherValue}`

  return {
    token,
    label: getReadable(token),
    value: otherValue ? joinOther : value
  }
}
