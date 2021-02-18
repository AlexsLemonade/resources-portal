import { object, string } from 'yup'

export const addressAttributes = [
  'name',
  'institution',
  'address_line_1',
  'address_line_2',
  'locality',
  'postal_code',
  'state',
  'country'
]

export default object({
  name: string().required(),
  institution: string().required(),
  address_line_1: string().required(),
  address_line_2: string(),
  locality: string().required(),
  postal_code: string(),
  state: string().required(),
  country: string().required()
})
