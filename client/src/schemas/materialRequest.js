import { object, string, number } from 'yup'
import addressSchema from 'schemas/address'
import getRequestRequirements from 'helpers/getRequestRequirements'

export const CREATE_REQUEST_RESOURCE_REQUIREMENTS = ['needs_abstract', 'needs_']

export const defaultSchema = object({
  material: number().required()
})

// this determines the schema for validating the create material request
export const getCreateRequestSchema = (resource) => {
  const {
    hasRequirements,
    needsAbstract,
    shippingRequirement: { needsShippingAddress }
  } = getRequestRequirements(resource)

  // default schema
  if (!hasRequirements) return defaultSchema

  let schema = defaultSchema

  if (needsAbstract) {
    schema = schema.shape({ requester_abstract: string().required() })
  }

  if (needsShippingAddress) {
    schema = schema.shape({ address: addressSchema })
  }

  return schema
}
