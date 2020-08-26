import { Anchor, Box, Button, Text, TextInput } from 'grommet'
import * as React from 'react'
import GrantIcon from '../images/grant.svg'
import { ORCIDSignInButton } from './modals/CommonModalContent'

export const CreateAccountStep = ({ ORCID, nextStep }) => {
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
            redirectUrl={`${process.env.CLIENT_HOST}/create-account?stepName=${nextStep}`}
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

export const EnterEmailStep = ({ createUser }) => {
  const onChange = (email) => {
    createUser.setEmail(email, true)
    createUser.save()
  }
  const onClick = () => {
    createUser.setCurrentStep('Create Account')
  }
  return (
    <>
      <TextInput
        placeholder="Enter email"
        onChange={(event) => onChange(event.target.value)}
        value={createUser.createUser.email || ''}
        type="email"
      />
      <Button
        label="Submit"
        onChange={onChange}
        disabled={!createUser.validEmail()}
        onClick={onClick}
      />
    </>
  )
}

export const VerifyGrantStep = ({ createUser }) => {
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
        {createUser.createUser.grants.map((grant) => (
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
        <Button label="Report missing/incorrect information" />
        <Button
          label="This information is correct"
          onClick={createUser.stepForward}
          primary
        />
      </Box>
    </Box>
  )
}

export const NextStepsStep = () => {
  return (
    <Box>
      <Text>TODO Next steps go here.</Text>
    </Box>
  )
}
