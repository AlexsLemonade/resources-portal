import { Box, Button, Heading } from 'grommet'
import React from 'react'
import {
  CreateAccountStep,
  EnterEmailStep,
  NextStepsStep,
  VerifyGrantStep
} from '../../components/CreateAccount'
import { ProgressBar } from '../../components/ProgressBar'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const getStepContent = ({ step, ORCID, setEmail, redirectUrl }) => {
  const stepDict = {
    'Create Account': (
      <CreateAccountStep
        ORCID={ORCID}
        redirectUrl={decodeURI(
          `${process.env.CLIENT_HOST}${redirectUrl}&stepNum=1`
        )}
      />
    ),
    'Enter Email': <EnterEmailStep setLocalEmail={setEmail} />,
    'Verify Grant Information': <VerifyGrantStep />,
    'Next Steps': <NextStepsStep />
  }
  return stepDict[step]
}

const CreateAccountPage = ({
  stepNum = 0,
  ORCID,
  email,
  grants,
  redirectUrl
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(stepNum)
  const decrement = () => setCurrentIndex(Math.max(0, currentIndex - 1))
  const increment = () =>
    setCurrentIndex(Math.min(steps.length - 1, currentIndex + 1))

  const [storedEmail, setStoredEmail] = useLocalStorage('email', email)
  const [storedGrants, setStoredGrants] = useLocalStorage('grants', grants)

  let steps = []

  steps = ['Create Account']
  if (!storedEmail) {
    steps.push('Enter Email')
  }
  if (storedGrants) {
    steps.push('Verify Grant Information')
  }
  steps.push('Next Steps')

  const stepContent = []
  let i = 0
  for (const step of steps) {
    stepContent.push(
      <Box key={step}>
        {currentIndex === i &&
          getStepContent({ step, ORCID, setStoredEmail, redirectUrl })}
      </Box>
    )
    i += 1
  }

  return (
    <Box width={{ min: '500px', max: '800px' }}>
      <Heading serif border="none" level="4">
        Create an Account
      </Heading>
      <Box width={{ min: '400px', max: '700px' }}>
        <Box pad="medium">
          <ProgressBar steps={steps} index={currentIndex} />
        </Box>
      </Box>
      {stepContent}
      <Button onClick={increment} />
      <Button onClick={decrement} />
    </Box>
  )
}

const CreateAccount = ({ stepNum, code, email, grants, redirectUrl }) => (
  <div className="container">
    <main>
      <CreateAccountPage
        ORCID="XXXX-XXXX-XXXX"
        stepNum={stepNum}
        code={code}
        email={email}
        grants={grants}
        redirectUrl={redirectUrl}
      />
    </main>
  </div>
)

CreateAccount.getInitialProps = async ({ req, query }) => {
  let queryJSON = {}

  if (query.json) {
    queryJSON = JSON.parse(query.json)
  }

  const initialProps = {}

  initialProps.code = query.code
  initialProps.stepNum = query.stepNum
  initialProps.email = queryJSON.email
  initialProps.grants = queryJSON.grant_info
  initialProps.redirectUrl = req.url

  return initialProps
}

export default CreateAccount
