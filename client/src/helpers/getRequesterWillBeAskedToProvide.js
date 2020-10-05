import getRequestRequirements from 'helpers/getRequestRequirements'

export default (request) => {
  const {
    needsIrb,
    needsMta,
    shippingRequirement: { needsPayment }
  } = getRequestRequirements(request.material)

  const additionalDocuments = []
  if (needsIrb) additionalDocuments.push('IRB')
  if (needsMta) additionalDocuments.push('signed MTA')
  if (needsPayment) additionalDocuments.push('shiping payment method')
  const { length } = additionalDocuments

  if (length === 2)
    return `${additionalDocuments[0]} and ${additionalDocuments[1]}`

  if (length > 2) {
    const lastItem = additionalDocuments[length - 1]
    additionalDocuments[length - 1] = `and ${lastItem}`
  }
  return additionalDocuments.join(', ')
}
