import { object, string, number, boolean } from 'yup'
import address from 'schemas/address'
import getRequestRequirements from 'helpers/getRequestRequirements'

export const defaultSchema = object({
  material: number().required(),
  save_for_reuse: boolean()
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
    schema = schema.shape({ address })
  }

  return schema
}
