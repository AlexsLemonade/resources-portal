import { Anchor, Box, Button, Layer, Text } from 'grommet'
import * as React from 'react'
import Cross from '../images/cross-black-tint-30.svg'
import ORCIDLogo from '../images/grant.svg'

export const ORCIDDescription = () => {
  return (
    <Box height="170px">
      <Box margin={{ top: 'large', bottom: 'small' }}>
        <Text weight="bold">What is an ORCID iD?</Text>
      </Box>
      <Box>
        <Text margin={{ top: 'small', bottom: 'none' }}>
          ORCID provides a persistent identifier – an ORCID iD – that
          distinguishes you from other researchers and a mechanism for linking
          your research outputs and activities to your iD.
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

export const AccountCreationInfo = ({ button }) => {
  return (
    <Box height="large" pad="small">
      <Text weight="bold">
        Create a BioResources Portal account with your ORCID iD
      </Text>
      <Text margin={{ top: 'small' }}>
        You can use your existing ORCID iD to create an BioResources Portal
        account. If you don’t have an ORCID iD, you can use the button below to
        create one!
      </Text>
      <Text margin={{ top: 'small' }}>
        You can use your BioResources Portal account to request resources, share
        your resources, and track and manage requests.
      </Text>
      {button}
    </Box>
  )
}

export const ORCIDSignInButton = ({ label }) => {
  let orcidPrefix = ''
  if (process.env.IS_DEVELOPMENT) {
    orcidPrefix = 'https://sandbox.orcid.org/'
  } else {
    orcidPrefix = 'https://orcid.org/'
  }

  const orcidUrl = `${orcidPrefix}oauth/authorize?client_id=${process.env.ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${process.env.CLIENT_HOST}`
  return (
    <Box
      alignSelf="center"
      pad="medium"
      margin={{ top: 'small' }}
      width="320px"
    >
      <Button label={label} href={orcidUrl} icon={<ORCIDLogo />} primary />
    </Box>
  )
}

export const Modal = ({ showing, setShowing, content }) => {
  return (
    <Box>
      {showing && (
        <Layer
          onEsc={() => setShowing(false)}
          onClickOutside={() => setShowing(false)}
        >
          <Box
            pad="none"
            gap="none"
            align="center"
            border={[{ color: 'black-tint-95' }]}
            background="white"
          >
            <Box alignSelf="end">
              <Button
                icon={<Cross />}
                onClick={() => setShowing(false)}
                alignSelf="start"
              />
            </Box>
            <Box fill pad="medium">
              {content}
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  )
}

export default Modal