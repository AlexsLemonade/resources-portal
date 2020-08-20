import { Box, Button, Heading } from 'grommet'
import React from 'react'
import api from '../../api'
import {
  CreateAccountStep,
  EnterEmailStep,
  NextStepsStep,
  VerifyGrantStep
} from '../../components/CreateAccount'
import { ProgressBar } from '../../components/ProgressBar'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useUser } from '../../hooks/useUser'

const getStepContent = ({ step, ORCID, grantInfo, setEmail, increment }) => {
  const stepDict = {
    'Create Account': <CreateAccountStep ORCID={ORCID} />,
    'Enter Email': <EnterEmailStep setLocalEmail={setEmail} />,
    'Verify Grant Information': (
      <VerifyGrantStep grantInfo={grantInfo} increment={increment} />
    ),
    'Next Steps': <NextStepsStep />
  }
  return stepDict[step]
}

const CreateAccount = ({
  stepNum,
  ORCID,
  email,
  grantInfo,
  code,
  originUrl
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const decrement = () => setCurrentIndex(Math.max(0, currentIndex - 1))
  const increment = () =>
    setCurrentIndex(Math.min(steps.length - 1, currentIndex + 1))
  const [storedEmail, setStoredEmail] = useLocalStorage('email', email)
  const [storedGrants, setStoredGrants] = useLocalStorage(
    'grantInfo',
    grantInfo
  )

  React.useEffect(() => {
    // Once you have redirected past the first step, subsequent renders
    // don't redirect to the step in the url.
    if (stepNum && currentIndex === 0) {
      setCurrentIndex(stepNum, 10)
    }

    if (email) {
      setStoredEmail(email)
    }

    if (grantInfo) {
      setStoredGrants(grantInfo)
    }
  })

  const { setUser, setToken, setLoginRedirectUrl } = useUser()

  React.useEffect(() => {
    const callCreateUser = async () => {
      if (code) {
        const [tokenRequest, userRequest] = await api.user.create({
          code,
          originUrl,
          email,
          grantInfo
        })

        if (!tokenRequest.isOk) {
          console.log('error', tokenRequest)
          return {}
        }

        const { token } = tokenRequest.response
        const redirectUrl = originUrl

        if (!userRequest.isOk) {
          console.log('errror', userRequest)
          return {}
        }

        const authenticatedUser = userRequest.response

        return { authenticatedUser, token, redirectUrl }
      }
      return {}
    }

    const { authenticatedUser, token, redirectUrl } = callCreateUser()

    setUser(authenticatedUser)
    setToken(token)
    setLoginRedirectUrl(redirectUrl)
  })

  let steps = []

  steps = ['Create Account']
  if (!storedEmail) {
    steps.push('Enter Email')
  }
  if (storedGrants) {
    steps.push('Verify Grant Information')
  }
  steps.push('Next Steps')

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
      {steps.map((step, i) => (
        <Box key={step}>
          {currentIndex === i &&
            getStepContent({
              step,
              ORCID,
              grantInfo: storedGrants,
              setStoredEmail,
              increment
            })}
        </Box>
      ))}
      <Button onClick={increment} />
      <Button onClick={decrement} />
    </Box>
  )
}

CreateAccount.getInitialProps = async ({ req, query }) => {
  let queryJSON = {}

  if (query.json) {
    queryJSON = JSON.parse(query.json)
  }

  const initialProps = {}

  initialProps.ORCID = query.ORCID
  initialProps.stepNum = parseInt(query.stepNum, 10)
  initialProps.email = queryJSON.email
  initialProps.grantInfo = queryJSON.grant_info
  initialProps.originUrl = decodeURI(`http://${req.headers.host}${req.url}`)
  initialProps.code = query.code

  return initialProps
}

export default CreateAccount
