import { Anchor, Box, Button, Text } from 'grommet'
import { useLocalStorage } from 'hooks/useLocalStorage'
import * as React from 'react'
import ORCIDLogo from '../../images/grant.svg'

export const ORCIDDescription = () => {
  return (
    <Box height="160px">
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

export const ORCIDSignInButton = ({ label, redirectUrl }) => {
  const [clientRedirectUrl, setClientRedirectUrl] = useLocalStorage(
    'clientRedirectUrl'
  )

  let orcidPrefix = ''
  if (process.env.IS_DEVELOPMENT) {
    orcidPrefix = 'https://sandbox.orcid.org/'
  } else {
    orcidPrefix = 'https://orcid.org/'
  }

  const orcidUrl = `${orcidPrefix}oauth/authorize?client_id=${
    process.env.ORCID_CLIENT_ID
  }&response_type=code&scope=/authenticate&redirect_uri=${decodeURI(
    redirectUrl
  )}`

  return (
    <Box
      alignSelf="center"
      pad="medium"
      margin={{ top: 'small' }}
      width="320px"
    >
      <Button
        label={label}
        href={orcidUrl}
        icon={<ORCIDLogo />}
        onClick={() =>
          setClientRedirectUrl(
            window.location.pathname + window.location.search
          )
        }
        primary
      />
    </Box>
  )
}
