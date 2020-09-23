import React from 'react'
import { useRouter } from 'next/router'
import { Box, Button } from 'grommet'
import useResourceForm from 'hooks/useResourceForm'
import ResourceDetailsForm from 'components/resources/ResourceDetailsForm'
import RequestRequirementsForm from 'components/resources/RequestRequirementsForm'
import ResourceEditImportedForm from 'components/resources/ResourceEditImportedForm'

export default () => {
  const router = useRouter()
  const { resource, validate, save, clearResourceContext } = useResourceForm()
  const [showRequirements, setShowRequirements] = React.useState(false)
  const { imported } = resource
  const showNext = !imported && !showRequirements
  const showSave = imported || showRequirements
  const showFormBox = imported || (!imported && !showRequirements)

  return (
    <Box width="xxlarge" align="center">
      {showFormBox && (
        <Box
          animation="slideUp"
          elevation="small"
          width="large"
          round="xsmall"
          background="white"
          pad="large"
        >
          {!imported && !showRequirements && <ResourceDetailsForm />}
          {imported && <ResourceEditImportedForm />}
        </Box>
      )}
      {showRequirements && <RequestRequirementsForm />}
      <Box
        width="large"
        direction="row"
        justify="end"
        margin={{ vertical: 'large' }}
      >
        {showNext && (
          <Button
            onClick={() => validate(() => setShowRequirements(true))}
            primary
            label="Next"
          />
        )}
        {showSave && (
          <Button
            onClick={() => {
              validate(async () => {
                if (await save()) {
                  clearResourceContext()
                  router.push(`/resources/${resource.id}`)
                }
              })
            }}
            primary
            label="Save"
          />
        )}
      </Box>
    </Box>
  )
}
