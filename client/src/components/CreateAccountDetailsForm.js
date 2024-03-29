import React from 'react'
import { string } from 'yup'
import { Box, Text, FormField, TextInput } from 'grommet'
import Button from 'components/Button'
import { Loader } from 'components/Loader'
import { useCreateUser } from 'hooks/useCreateUser'
import { getReadable } from 'helpers/readableNames'

export default ({ onSubmit }) => {
  const { newUser, setNewUser, required, requiredRef } = useCreateUser()
  const emailSchema = string().email().required()
  const [valid, setValid] = React.useState(false)
  const [firstName, setFirstName] = React.useState(newUser.first_name)
  const [lastName, setLastName] = React.useState(newUser.last_name)
  const [email, setEmail] = React.useState(newUser.email)
  const inputOrder = ['first_name', 'last_name', 'email']

  // simple way to sort the order of the required inputs in place
  if (required) {
    required.sort((a, b) => inputOrder.indexOf(a) > inputOrder.indexOf(b))
  }

  // validate on any value change
  React.useEffect(() => {
    if (!required) return
    let newValid = true
    if (required.includes('first_name') && !firstName) newValid = false
    if (required.includes('last_name') && !lastName) newValid = false
    if (required.includes('email')) {
      try {
        emailSchema.validateSync(email)
      } catch (e) {
        newValid = false
      }
    }

    if (valid !== newValid) setValid(newValid)
  })

  const onChange = (attribute, value) => {
    if (attribute === 'email') setEmail(value)
    if (attribute === 'first_name') setFirstName(value)
    if (attribute === 'last_name') setLastName(value)
  }

  const onClick = () => {
    setNewUser({
      ...newUser,
      email,
      first_name: firstName,
      last_name: lastName
    })
    if (onSubmit) onSubmit()
  }

  const values = { email, first_name: firstName, last_name: lastName }

  return (
    <>
      {!required && !requiredRef.current && <Loader />}
      {required && (
        <Box>
          <Text>
            Below is the information we were unable to extract from ORCID.
            Please provide the missing information below.
          </Text>
        </Box>
      )}
      <Box margin={{ bottom: 'medium' }}>
        {required &&
          required.map((attribute) => (
            <FormField key={attribute} label={getReadable(attribute)}>
              <TextInput
                width="300px"
                onChange={(event) => onChange(attribute, event.target.value)}
                value={values[attribute] || ''}
                type={attribute === 'email' ? 'email' : 'text'}
              />
            </FormField>
          ))}
      </Box>
      {required && (
        <Box justify="end">
          <Button
            alignSelf="end"
            primary
            label="Next"
            onChange={onChange}
            disabled={!valid}
            onClick={onClick}
          />
        </Box>
      )}
    </>
  )
}
