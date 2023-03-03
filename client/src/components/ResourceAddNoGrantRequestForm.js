import React from 'react'
import {
  Anchor,
  Box,
  Text,
  FormField,
  Paragraph,
  TextArea,
  TextInput
} from 'grommet'
import { useRouter } from 'next/router'
import Icon from 'components/Icon'
import Button from 'components/Button'
import ResourceFormFieldLabel from 'components/resources/ResourceFormFieldLabel'
import FormFieldErrorLabel from 'components/FormFieldErrorLabel'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import useHubspotForm from 'hooks/useHubspotForm'
import formSchema from 'schemas/resourceAddNoGrantRequest'

export default ({ onCancel, onSubmit }) => {
  const anythingElse = 'Is there anything else you would like to add?'
  const { addAlert } = useAlertsQueue()
  const [sent, setSent] = React.useState()
  const router = useRouter()
  const portalId = process.env.HUBSPOT_PORTAL_ID
  const formId = process.env.HUBSPOT_NO_GRANT_FORM_ID
  const {
    getAttribute,
    setAttribute,
    submit,
    validate,
    errors,
    hasError
  } = useHubspotForm(portalId, formId)
  const handleSubmit = async () => {
    const valid = await validate(formSchema)
    if (valid) {
      const submitRequest = await submit()

      if (submitRequest.isOk) {
        addAlert('Request submitted successfully', 'success')
        setSent(true)
        if (onSubmit) onSubmit()
        router.push('/')
      } else {
        addAlert('Unable to save please try again later', 'error')
      }
    }
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    router.push('/')
  }

  const getError = (attribute) => {
    if (errors[attribute]) {
      return <FormFieldErrorLabel message={errors[attribute]} />
    }
    return false
  }

  if (sent) {
    return (
      <Box
        height={{ min: 'min-content' }}
        pad={{ bottom: 'medium' }}
        margin={{ bottom: 'medium' }}
        direction="row"
      >
        <Text margin={{ top: '2px', right: '4px' }}>
          <Icon name="Check" color="success" />
        </Text>
        <Text serif size="large">
          Message Sent!
        </Text>
      </Box>
    )
  }

  return (
    <>
      <Box
        border={{
          side: 'bottom',
          color: 'border-black',
          size: 'small'
        }}
        height={{ min: 'min-content' }}
        pad={{ bottom: 'medium' }}
        margin={{ bottom: 'medium' }}
        direction="row"
      >
        <Text margin={{ top: '2px', right: '4px' }}>
          <Icon name="Warning" color="error" />
        </Text>
        <Text serif size="large">
          Not Supported - Adding Resource without a Grant.
        </Text>
      </Box>
      <Box>
        <Paragraph>
          We currently only support adding a resource with an{' '}
          <Text weight="bold">ALSF Grant</Text>. If you have an ALSF grant,
          please reach out to the{' '}
          <Anchor
            label="Grants Team"
            href="mailto:grants@alexslemonade.org?subject=CCRR%20Portal:%20Invite%20Link%20Request"
          />{' '}
          for an invite.
        </Paragraph>
      </Box>
      <Box>
        <Paragraph>
          We are trying gauge interest from researchers without an ALSF Grant in
          sharing resources via the CCRR portal. If you are interested, please
          fill out the form below and we will let you know when this feature
          becomes available.
        </Paragraph>
      </Box>
      <Box>
        <Box direction="row" gap="medium">
          <FormField
            label="First Name"
            error={getError('firstname')}
            width="full"
          >
            <TextInput
              value={getAttribute('firstname') || ''}
              onChange={({ target: { value } }) => {
                setAttribute('firstname', value)
              }}
            />
          </FormField>
          <FormField
            label="Last Name"
            error={getError('lastname')}
            width="full"
          >
            <TextInput
              value={getAttribute('lastname') || ''}
              onChange={({ target: { value } }) => {
                setAttribute('lastname', value)
              }}
            />
          </FormField>
        </Box>
        <FormField label="Email" error={getError('email')}>
          <TextInput
            value={getAttribute('email') || ''}
            onChange={({ target: { value } }) => {
              setAttribute('email', value)
            }}
          />
        </FormField>
        <FormField
          label={<ResourceFormFieldLabel optional attribute={anythingElse} />}
          error={getError('additional_info__adding_resources_without_grant_id')}
        >
          <TextArea
            value={getAttribute(
              'additional_info__adding_resources_without_grant_id'
            )}
            onChange={({ target: { value } }) => {
              setAttribute(
                'additional_info__adding_resources_without_grant_id',
                value
              )
            }}
          />
        </FormField>
      </Box>
      <Box
        direction="row"
        justify="end"
        gap="medium"
        margin={{ vertical: 'medium' }}
      >
        <Button label="Cancel" onClick={handleCancel} />
        <Button
          primary
          label="Submit"
          onClick={handleSubmit}
          disabled={hasError}
        />
      </Box>
    </>
  )
}
