import { Anchor, Box, Button, Text, TextInput } from 'grommet'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { useCreateUser } from 'hooks/useCreateUser'
import * as React from 'react'
import GrantIcon from '../images/grant.svg'
import NextSteps from '../images/join-by-invite-next-steps.svg'
import { ORCIDSignInButton } from './CreateAccountLoginButton'
import { IncorrectGrantModal } from './modals/IncorrectGrantModal'

export const CreateAccountStep = () => {
  const { ORCID, getNextStep } = useCreateUser()
  return (
    <Box>
      <Text>
        You can use your BioResources portal account to request resources, track
        requests, and share your own resources.
      </Text>
      <Text>
        Use your existing ORCID iD to create a Bio Resources Portal account. If
        you do not have an ORCID iD, you can use the button below to create one.
      </Text>
      <Box
        align="center"
        width="large"
        alignSelf="center"
        margin={{ top: 'small' }}
        border={[{ size: 'small', side: 'bottom', color: 'black-tint-95' }]}
      >
        <Box>
          {ORCID && (
            <Text>Our records show that your ORCID iD is {ORCID}.</Text>
          )}
        </Box>
        <Box align="center" pad="medium" gap="medium">
          <ORCIDSignInButton
            label="Sign in with ORCID iD"
            redirectUrl={`${
              process.env.CLIENT_HOST
            }/create-account?stepName=${getNextStep()}`}
          />
        </Box>
      </Box>
      <Box margin={{ bottom: 'large' }}>
        <Text weight="bold" margin={{ top: 'large' }}>
          What is an ORCID iD?
        </Text>
        <Text margin={{ top: 'small' }}>
          ORCID provides a persistent identifier – an ORCID iD – that
          distinguishes you from other researchers and links your research
          outputs and activities to your iD.
        </Text>
        <Anchor
          color="#017FA3"
          href="https://orcid.org/"
          label="Learn more at orcid.org"
        />
      </Box>
    </Box>
  )
}

export const EnterEmailStep = () => {
  const {
    setEmail,
    setNeedsEmail,
    stepForward,
    save,
    user,
    createUser,
    validEmail
  } = useCreateUser()
  const onChange = (email) => {
    setEmail(email)
    save()
  }
  const onClick = () => {
    setNeedsEmail(false)
    stepForward()
  }
  if (user) {
    return (
      <Box pad="medium" gap="medium">
        <Text>
          The following email was retrieved from your ORCID record: {user.email}
        </Text>
        <Box width="200px" alignSelf="center">
          <Button label="Continue" onClick={stepForward} />
        </Box>
      </Box>
    )
  }

  return (
    <Box pad="medium" gap="medium" width={{ min: '400px' }}>
      <Box>
        <Text>Enter your email below:</Text>
      </Box>
      <TextInput
        width="300px"
        placeholder="Enter email"
        onChange={(event) => onChange(event.target.value)}
        value={createUser.email || ''}
        type="email"
      />
      <Box width="200px" alignSelf="center">
        <Button
          label="Submit"
          onChange={onChange}
          disabled={!validEmail()}
          onClick={onClick}
        />
      </Box>
    </Box>
  )
}

export const VerifyGrantStep = () => {
  const { stepForward, createUser } = useCreateUser()
  const { addAlert } = useAlertsQueue()
  const [showing, setShowing] = React.useState(false)

  if (alert) {
    addAlert(alert, 'success')
    setAlert('')
  }

  const [alert, setAlert] = React.useState('')

  return (
    <Box gap="medium">
      <Text weight="bold">Your account has been created!</Text>
      <Text>
        Please take a moment to verify the grants you have recieved from Alex's
        Lemonade Stand Foundation.
      </Text>
      <Text margin={{ top: 'small' }} weight="bold">
        Grants Recieved
      </Text>
      <Box gap="medium">
        {createUser.grants.map((grant) => (
          <Box key={grant.funder_id} direction="row" align="center">
            <Box pad="small">
              <GrantIcon />
            </Box>
            <Box direction="column">
              <Text>{grant.title}</Text>
              <Text size="small">Grant ID: {grant.funder_id}</Text>
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        direction="row"
        gap="medium"
        basis="3/4"
        alignSelf="end"
        margin={{ top: 'medium' }}
      >
        <Button
          label="Report missing/incorrect information"
          onClick={() => setShowing(true)}
        />
        <IncorrectGrantModal
          showing={showing}
          setShowing={setShowing}
          setAlert={setAlert}
        />
        <Button
          label="This information is correct"
          onClick={() => {
            addAlert('Your account was created', 'success')
            stepForward()
          }}
          primary
        />
      </Box>
    </Box>
  )
}

export const NextStepsStep = () => {
  return (
    <Box direction="row" gap="xlarge">
      <Box direction="column" width="300px" gap="large">
        <Box width="200px">
          <Button label="Add a Resource" href="/resources" primary />
        </Box>
        <Anchor
          color="#017FA3"
          href="/organization"
          label="Add members of your lab or organization to help you manage resources"
        />
      </Box>
      <NextSteps />
    </Box>
  )
}
