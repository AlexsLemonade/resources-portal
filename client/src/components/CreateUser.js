import {
    CreateAccountStep,
    EnterEmailStep,
    NextStepsStep,
    VerifyGrantStep
} from 'components/CreateAccount'
import { ProgressBar } from 'components/ProgressBar'
import { Box, Button, Heading } from 'grommet'
import { useCreateUser } from 'hooks/useCreateUser'
import React from 'react'

export default ({ props }) => {
  const { ORCID, email, stepName, grants, code, originUrl } = props
  const {
    steps,
    currentStep,
    stepBack,
    stepForward,
    setCurrentStep
  } = useCreateUser(email, grants, ORCID, code, originUrl)

  const [redirectAlreadyFired, setRedirectAlreadyFired] = React.useState(false)

  React.useEffect(() => {
    if (stepName && !redirectAlreadyFired) {
      setCurrentStep(stepName)
      setRedirectAlreadyFired(true)
    }
  })

  return (
    <>
      <Heading serif border="none" level="4">
        Create an Account
      </Heading>
      <Box width={{ min: '400px', max: '700px' }}>
        <Box pad="medium">
          <ProgressBar steps={steps} index={steps.indexOf(currentStep)} />
        </Box>
      </Box>
      {currentStep === 'Create Account' && <CreateAccountStep />}
      {currentStep === 'Enter Email' && <EnterEmailStep />}
      {currentStep === 'Verify Grants' && <VerifyGrantStep />}
      {currentStep === 'Next Steps' && <NextStepsStep />}
      <Button onClick={stepBack} />
      <Button onClick={stepForward} />
    </>
  )
}
