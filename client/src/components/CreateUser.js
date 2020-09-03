import {
  CreateAccountStep,
  EnterEmailStep,
  NextStepsStep,
  VerifyGrantStep
} from 'components/CreateAccount'
import { ProgressBar } from 'components/ProgressBar'
import { Box, Heading } from 'grommet'
import { useCreateUser } from 'hooks/useCreateUser'
import { useRouter } from 'next/router'
import React from 'react'

export default ({ props }) => {
  const { ORCID, email, stepName, grants, code, originUrl } = props
  const { steps, currentStep, setCurrentStep } = useCreateUser(
    email,
    grants,
    ORCID,
    code,
    originUrl
  )
  const router = useRouter()

  if (!grants) {
    router.replace('/')
  }

  const [redirectAlreadyFired, setRedirectAlreadyFired] = React.useState(false)

  React.useEffect(() => {
    if (stepName && !redirectAlreadyFired) {
      setCurrentStep(stepName)
      setRedirectAlreadyFired(true)
    }
  })

  return (
    <Box pad="small">
      <Heading serif border="none" level="4">
        {currentStep}
      </Heading>
      <Box width={{ min: '400px', max: '900px' }}>
        <Box pad="medium">
          <ProgressBar steps={steps} index={steps.indexOf(currentStep)} />
        </Box>
        <Box alignSelf="center">
          {currentStep === 'Create an Account' && <CreateAccountStep />}
          {currentStep === 'Enter Email' && <EnterEmailStep />}
          {currentStep === 'Verify Grant Information' && <VerifyGrantStep />}
          {currentStep === 'Next Steps' && <NextStepsStep />}
        </Box>
      </Box>
    </Box>
  )
}
