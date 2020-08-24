import { Box, Button, Heading } from 'grommet'
import React from 'react'
import { ProgressBar } from '../../components/ProgressBar'
import { useCreateUser } from '../../hooks/useCreateUser'

const CreateAccount = ({ ORCID, email, grants, stepName, code, originUrl }) => {
  const createUser = useCreateUser(email, grants, ORCID, code, originUrl)
  const [redirectAlreadyFired, setRedirectAlreadyFired] = React.useState(false)

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
            index={createUser.steps.indexOf(createUser.currentStep)}
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

  return {
    ORCID: query.ORCID,
    email: queryJSON.email,
    grants: queryJSON.grant_info,
    code: query.code,
    originUrl: decodeURI(`http://${req.headers.host}${req.url}`),
    stepName: query.stepName
  }
}

export default CreateAccount
