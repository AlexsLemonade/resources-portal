import React from 'react'
import { Box, Heading } from 'grommet'
import { useRouter } from 'next/router'
import {
  CreateAccountStep,
  EnterEmailStep,
  NextStepsStep,
  VerifyGrantStep
} from 'components/CreateAccount'
import { ProgressBar } from 'components/ProgressBar'
import { useCreateUser } from 'hooks/useCreateUser'
import getRedirectQueryParam from 'helpers/getRedirectQueryParam'

export default ({ ORCID, clientPath, code, stepName }) => {
  const router = useRouter()
  const { newUser, steps, currentStep, setCurrentStep } = useCreateUser(
    code,
    getRedirectQueryParam(clientPath)
  )

  React.useEffect(() => {
    // this component requires newUser to have grants
    if (!newUser.grants) {
      router.replace('/')
    } else if (stepName && stepName !== currentStep) {
      setCurrentStep(stepName)
    }
  }, [])

  return (
    <Box pad="small">
      <Heading serif border="none" level="4">
        {currentStep}
      </Heading>
      <Box width={{ min: '400px', max: '900px' }}>
        <Box pad="medium">
          <ProgressBar steps={steps} index={steps.indexOf(currentStep)} />
        </Box>
        <Box>
          {currentStep === 'Create an Account' && (
            <CreateAccountStep ORCID={ORCID} />
          )}
          {currentStep === 'Enter Email' && <EnterEmailStep />}
          {currentStep === 'Verify Grant Information' && <VerifyGrantStep />}
          {currentStep === 'Next Steps' && <NextStepsStep />}
        </Box>
      </Box>
    </Box>
  )
}
