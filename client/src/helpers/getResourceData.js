import { getReadable } from './readableNames'

const customResourceData = {
  description_or_abstract: (resource) => {
    if (resource.description && resource.description.length > 0)
      return getResourceData(resource, 'description')
    if (resource.abstract && resource.abstract.length > 0)
      return getResourceData(resource, 'abstract')
    return getResourceData(resource, 'description')
  }
}

export const getResourceData = (resource, token) => {
  if (token in customResourceData) {
    return customResourceData[token](resource, token)
  }

  return {
    token,
    label: getReadable(token),
    value: resource[token] || resource.additional_metadata[token]
  }
}
