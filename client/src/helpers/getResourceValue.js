const customResourceValues = {}

export const getResourceValue = (resource, token) => {
  if (token in customResourceValues) {
    return customResourceValues[token](resource)
  }
  return resource[token] || resource.additional_metadata[token]
}
