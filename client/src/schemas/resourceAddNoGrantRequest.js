import { object, string } from 'yup'

export default object({
  firstname: string().required('Please enter your first name.'),
  lastname: string().required('Please enter your last name.'),
  email: string().email().required('Please enter your email.'),
  additional_info__adding_resources_without_grant_id: string()
})
