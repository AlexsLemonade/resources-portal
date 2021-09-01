import React from 'react'
import { Box, FormField, Select } from 'grommet'
import {
  TeamLabel,
  GrantIdLabel
} from 'components/resources/ResourceTypeSelector'
import useResourceForm from 'hooks/useResourceForm'
import { getReadable, getToken } from 'helpers/readableNames'
import grantTitleYear from 'helpers/grantTitleYear'
import { importSources } from '.'

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
  const grant = grants ? grants[0] : undefined
  return (
    <Box direction="row" gap="medium">
      <FormField label={<TeamLabel />} htmlFor="select1">
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
      <FormField label={<GrantIdLabel />} htmlFor="select2">
        <Select
          disabled={!organization}
          options={grantOptions || []}
          labelKey={grantTitleYear}
          valueKey="id"
          value={grant}
          placeholder="Select Grant"
          dropHeight="medium"
          onChange={({ option }) => {
            setAttribute('grants', [option])
          }}
        />
      </FormField>
      <FormField label="Import from" htmlFor="select3">
        <Select
          disabled={!grant || !organization}
          options={importSources.map(getReadable)}
          value={getReadable(resource.import_source)}
          placeholder="Select Import Source"
          onChange={({ option }) => {
            setAttribute('import_source', getToken(option))
          }}
        />
      </FormField>
    </Box>
  )
}
