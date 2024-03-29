import React from 'react'
import { Box, Heading } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import useResourceForm from 'hooks/useResourceForm'
import { HeaderRow } from '../HeaderRow'
import { ResourceFormField } from './ResourceFormField'

export default ({ edit = false }) => {
  const {
    form,
    resource,
    getAttribute,
    setAttribute,
    contactUserOptions,
    attributeHasError,
    optionalAttributes = []
  } = useResourceForm()
  if (!form) return <></>
  return (
    <>
      <Box
        border={{ side: 'bottom', color: 'alexs-light-blue-tint-20' }}
        margin={{ bottom: 'medium' }}
      >
        <Heading level={5} weight="normal" margin="none">
          {edit && 'Edit '}Resource Details
        </Heading>
      </Box>
      {form.map((formGroup, index) => (
        <Box key={`section-${Object.keys(formGroup)[0]}`}>
          <Box margin={{ top: index !== 0 ? 'medium' : 'none' }}>
            <HeaderRow label={getReadable(Object.keys(formGroup)[0])} />
          </Box>
          {Object.values(formGroup)[0].map((attribute) => (
            <ResourceFormField
              key={`field-${attribute}`}
              getAttribute={getAttribute}
              setAttribute={setAttribute}
              attribute={attribute}
              contactUserOptions={contactUserOptions}
              resource={resource}
              error={attributeHasError(attribute)}
              optionalAttributes={optionalAttributes}
            />
          ))}
        </Box>
      ))}
    </>
  )
}
