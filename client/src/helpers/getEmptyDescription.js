export const emptyDescriptors = {}

export const getEmptyDescription = (attribute) => {
  if (attribute in emptyDescriptors) return emptyDescriptors[attribute]
  return 'Not Specified'
}
