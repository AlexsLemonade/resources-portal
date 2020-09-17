import React from 'react'
import { Box, Heading } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import useResourceForm from 'hooks/useResourceForm'
import { HeaderRow } from '../HeaderRow'
import { ResourceFormField } from './ResourceFormField'

// TODO:
// Add api integration
// add helper text
export default () => {
  const {
    form,
    getAttribute,
    setAttribute,
    contactUserOptions,
    attributeHasError
  } = useResourceForm()
  if (!form) return <></>
  return (
    <>
      <Box
        border={{ side: 'bottom', color: 'turteal-tint-40' }}
        margin={{ bottom: 'medium' }}
      >
        <Heading level={5} weight="normal" margin="none">
          Resource Details
        </Heading>
      </Box>
      {form.map((formGroup, index) => (
        <Box key={`section_${Object.keys(formGroup)[0]}`}>
          <Box margin={{ top: index !== 0 ? 'medium' : 'none' }}>
            <HeaderRow label={getReadable(Object.keys(formGroup)[0])} />
          </Box>
          {Object.values(formGroup)[0].map((attribute) => (
            <ResourceFormField
              key={`${attribute}_field`}
              getAttribute={getAttribute}
              setAttribute={setAttribute}
              attribute={attribute}
              contactUserOptions={contactUserOptions}
              error={attributeHasError(attribute)}
            />
          ))}
        </Box>
      ))}
    </>
  )
}
