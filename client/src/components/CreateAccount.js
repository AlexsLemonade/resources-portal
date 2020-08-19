import { Anchor, Box, Button, Text, TextInput } from 'grommet'
import * as React from 'react'
import { ORCIDSignInButton } from './Modal'

export const CreateAccountStep = ({ ORCID, redirectUrl }) => {
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
        margin={{ top: 'large' }}
        border={[{ size: 'small', side: 'bottom', color: 'black-tint-95' }]}
      >
        <Text>Our records show that your ORCID iD is {ORCID}</Text>
        <Box align="center" pad="medium" gap="large">
          <ORCIDSignInButton
            label="Sign in with ORCID iD"
            redirectUrl={redirectUrl}
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

export const EnterEmailStep = ({ setLocalEmail }) => {
  const [email, setEmail] = React.useState('')
  const onClick = () => {
    setLocalEmail(email)
  }
  return (
    <>
      <TextInput
        placeholder="Enter email"
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button label="Submit" onClick={onClick} />
    </>
  )
}

export const VerifyGrantStep = () => {
  return (
    <Box>
      <Text>TODO Verify grant step goes here.</Text>
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
