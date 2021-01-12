import React from 'react'
import { Box, Button, Heading, Paragraph, Text } from 'grommet'
import ResourceTypeSelector from 'components/resources/ResourceTypeSelector'
import { ProgressBar } from 'components/ProgressBar'
import ResourceDetailsForm from 'components/resources/ResourceDetailsForm'
import RequestRequirementsForm from 'components/resources/RequestRequirementsForm'
import ResourceReview from 'components/resources/ResourceReview'
import ResourceAdded from 'components/resources/ResourceAdded'

import { InfoCard } from 'components/InfoCard'
import Icon from 'components/Icon'
import useResourceForm from 'hooks/useResourceForm'

export default ({ defaultStep = -1 }) => {
  const [savedResource, setSavedResource] = React.useState(false)
  const [step, setStep] = React.useState(defaultStep)
  const goBack = () => {
    setStep(step - 1)
  }
  const goToNextStep = () => {
    // validate current step
    setStep(step + 1)
  }
  // this is used to pass into the various components for creating a resource
  const {
    validate,
    validateShippingRequirement,
    resource,
    save,
    clearResourceContext,
    getAttribute,
    setAttribute
  } = useResourceForm()

  const loadedRef = React.useRef(false)

  React.useEffect(() => {
    if (
      !loadedRef.current &&
      step === defaultStep &&
      defaultStep === -1 &&
      resource.organization
    ) {
      setStep(0)
      loadedRef.current = true
    }

    // force not imported
    if (resource && getAttribute('imported') === undefined)
      setAttribute('imported', false)

    if (savedResource) {
      clearResourceContext()
    }
  })

  if (savedResource) return <ResourceAdded resource={savedResource} />

  return (
    <>
      <Heading level={4} serif>
        List a Resource
      </Heading>
      <Box align="center">
        <Box fill margin={{ bottom: 'xxlarge' }}>
          <ProgressBar
            steps={[
              'Resource Details',
              'Request Requirements',
              'Review And Publish'
            ]}
            index={step}
          />
        </Box>
        {step === -1 && (
          <Box width="large" margin={{ bottom: 'xlarge' }}>
            <Box width="large" gap="large">
              <Box align="center">
                <Box width="medium">
                  <InfoCard>
                    If you are not shipping the resource from your lab, please
                    use the import option to list your resource.
                  </InfoCard>
                </Box>
              </Box>
              <Text weight="bold">
                Before we get started here are a few things to keep handy:{' '}
              </Text>
              <Box direction="row" align="center" gap="medium">
                <Icon color="plain" name="Details" size="large" />
                <Paragraph>
                  <Text weight="bold">Detailed metadata</Text> for your resource
                </Paragraph>
              </Box>
              <Box direction="row" align="center" gap="medium">
                <Icon color="plain" name="MTA" size="large" />
                <Box>
                  <Paragraph>
                    If your institution requires a{' '}
                    <Text weight="bold">Material Transfer Agreement (MTA)</Text>{' '}
                    to share, you will need to upload it in order to list your
                    resource.
                  </Paragraph>
                </Box>
              </Box>
              <Box direction="row" align="center" gap="medium">
                <Icon color="plain" name="Deliver" size="large" />
                <Paragraph>
                  If your{' '}
                  <Text weight="bold">resource needs to be shipped</Text>, you
                  will need to provide any restrictions that are imposed by you
                  or your organization (e.g. cannot ship internationally or can
                  only ship via specific providers such as UPS or FedEx).
                </Paragraph>
              </Box>
              <Box pad={{ vertical: 'medium', horizontal: 'xlarge' }}>
                <Text>
                  Please be aware that you are responsible for administrative
                  activities such as reviewing and responding to requests and
                  shipping/sending resources to requesters. We only provide the
                  infrastructure to enable sharing and improve transparency
                  during the sharing process.
                </Text>
              </Box>
            </Box>
            <Box
              margin={{ top: 'large' }}
              align="end"
              justify="end"
              width="large"
            >
              <Button onClick={goToNextStep} primary label="Get Started!" />
            </Box>
          </Box>
        )}
        {step === 0 && (
          <>
            <Box align="center" margin={{ bottom: 'large' }}>
              <ResourceTypeSelector />
            </Box>
            {resource.category && (
              <Box
                animation="slideUp"
                elevation="small"
                width="large"
                round="xsmall"
                background="white"
                pad="large"
              >
                <ResourceDetailsForm />
              </Box>
            )}
            <Box
              width="large"
              direction="row"
              justify="end"
              margin={{ vertical: 'large' }}
              gap="medium"
            >
              <Button onClick={goBack} label="Back" />
              <Button
                onClick={() => {
                  validate(goToNextStep)
                }}
                primary
                label="Next"
              />
            </Box>
          </>
        )}
        {step === 1 && (
          <>
            <RequestRequirementsForm />
            <Box
              width="large"
              direction="row"
              justify="end"
              margin={{ vertical: 'large' }}
              gap="medium"
            >
              <Button onClick={goBack} label="Back" />
              <Button
                primary
                label="Next"
                onClick={() => {
                  if (validateShippingRequirement()) {
                    goToNextStep()
                  }
                }}
              />
            </Box>
          </>
        )}
        {step === 2 && (
          <>
            <ResourceReview
              onEditResourceDetails={() => setStep(0)}
              onEditResourceRequirements={() => setStep(1)}
            />
            <Box
              width="xlarge"
              direction="row"
              justify="end"
              gap="large"
              margin={{ vertical: 'large' }}
            >
              <Button
                primary
                onClick={async () => {
                  const finishedResource = await save()
                  if (finishedResource.id) setSavedResource(finishedResource)
                }}
                label="List Resource"
              />
            </Box>
          </>
        )}
      </Box>
    </>
  )
}
