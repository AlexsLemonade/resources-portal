import React from 'react'
import { Box, FormField, Select } from 'grommet'
import HelpLink from 'components/HelpLink'
import useResourceForm from 'hooks/useResourceForm'
import { getReadable, getToken } from 'helpers/readableNames'
import FormFieldErrorLabel from 'components/FormFieldErrorLabel'
import { resourceCategories } from '.'

export const TeamLabel = () => (
  <HelpLink label="Team" path="how-do-i-list-a-resource#grant-team-info" />
)

export const GrantIdLabel = () => (
  <HelpLink label="Grant" path="how-do-i-list-a-resource#grant-team-info" />
)

export default () => {
  const {
    getAttribute,
    setAttribute,
    organizationOptions,
    grantOptions,
    resource
  } = useResourceForm()
  const organization = getAttribute('organization')
  const grants = getAttribute('grants')
  // this will be removed if we support multiple grants
  const grant = grants && grants.length > 0 ? grants[0] : {}

  const showGrantRequired = Object.keys(grant).length === 0 && resource.category

  return (
    <Box direction="row" gap="medium">
      <FormField label={<TeamLabel />}>
        <Select
          options={organizationOptions || []}
          labelKey="name"
          valueKey="id"
          value={{ id: organization }}
          placeholder="Select Team"
          dropHeight="medium"
          onChange={({ option }) => {
            setAttribute('organization', option)
          }}
        />
      </FormField>
      <FormField
        label={<GrantIdLabel />}
        error={showGrantRequired && <FormFieldErrorLabel />}
      >
        <Select
          disabled={!organization}
          options={grantOptions || []}
          labelKey="title"
          valueKey="id"
          value={grant}
          placeholder="Select Grant"
          dropHeight="medium"
          onChange={({ option }) => {
            setAttribute('grants', [option])
          }}
        />
      </FormField>
      <FormField label="Resource Type">
        <Select
          disabled={!grant || !organization}
          options={resourceCategories.map(getReadable)}
          value={getReadable(resource.category)}
          placeholder="Select Resource Type"
          onChange={({ option }) => setAttribute('category', getToken(option))}
        />
      </FormField>
    </Box>
  )
}
