import { Box, Button, Heading } from 'grommet'
import React from 'react'
import { ProgressBar } from '../../components/ProgressBar'
import { useCreateUser } from '../../hooks/useCreateUser'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useUser } from '../../hooks/useUser'

const CreateAccount = ({ ORCID, email, grants, stepName, code, originUrl }) => {
  const createUser = useCreateUser(email, grants, ORCID)
  const [redirectAlreadyFired, setRedirectAlreadyFired] = React.useState()
  const [stepsAlreadyGenerated, setStepsAlreadyGenerated] = useLocalStorage(
    'stepsAlreadyGenerated',
    false
  )

  const { user } = useUser()

  React.useEffect(() => {
    if (code && !user) {
      createUser.createAndLoginUser(code, originUrl)
    }
  })

  if (!stepsAlreadyGenerated) {
    createUser.generateSteps()
    setStepsAlreadyGenerated(true)
  }

  console.log('initialsteps: ', createUser.steps)

  if (stepName && !redirectAlreadyFired) {
    createUser.setCurrentStep(stepName)
    setRedirectAlreadyFired(true)
  }

  return (
    <Box width={{ min: '500px', max: '800px' }}>
      <Heading serif border="none" level="4">
        Create an Account
      </Heading>
      <Box width={{ min: '400px', max: '700px' }}>
        <Box pad="medium">
          <ProgressBar
            steps={createUser.steps}
            index={createUser.getStepIndex()}
          />
        </Box>
      </Box>
      {createUser.steps.map((step) => (
        <Box key={step}>
          {createUser.currentStep === step &&
            createUser.getStepComponent(step, createUser)}
        </Box>
      ))}
      <Button onClick={createUser.stepBack} />
      <Button onClick={createUser.stepForward} />
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
  initialProps.email = queryJSON.email
  initialProps.grants = queryJSON.grant_info
  initialProps.code = query.code
  initialProps.originUrl = decodeURI(`http://${req.headers.host}${req.url}`)
  initialProps.stepName = query.stepName

  return initialProps
}

export default CreateAccount
