/* eslint-disable react/jsx-curly-newline */
import { Anchor, Box, Button, Heading, Text } from 'grommet'
import { useLocalStorage } from 'hooks/useLocalStorage'
import * as React from 'react'
import ORCIDLogo from '../images/grant.svg'
import { LoginButton } from './LoginButton'
import { Modal } from './Modal'

export const ORCIDSignInButton = ({
  label,
  redirectUrl = `${process.env.CLIENT_HOST}/account`
}) => {
  const [, setClientRedirectUrl] = useLocalStorage('clientRedirectUrl')

  const orcidUrl = `${process.env.ORCID_URL}oauth/authorize?client_id=${
    process.env.ORCID_CLIENT_ID
  }&response_type=code&scope=/authenticate&redirect_uri=${decodeURI(
    redirectUrl
  )}`

  return (
    <Box alignSelf="center" pad="medium" margin={{ top: 'small' }}>
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

export const CreateOrLogin = ({ title, showSignIn = true }) => {
  return (
    <Box width="700px" gap="medium">
      <Box
        fill="horizontal"
        border={[{ size: 'small', side: 'bottom', color: 'black-tint-95' }]}
        height={{ min: '50px', max: '70px' }}
      >
        <Heading serif margin={{ top: 'none', bottom: 'small' }} level="5">
          {title}
        </Heading>
      </Box>
      <Box direction="row">
        {showSignIn && (
          <Box
            align="center"
            width={{ min: '300px' }}
            border={[{ size: 'small', side: 'right', color: 'black-tint-95' }]}
          >
            <Text weight="bold">Sign in with your ORCID iD</Text>
            <Box
              align="center"
              margin={{ top: 'medium' }}
              height={{ min: '40px' }}
            >
              <ORCIDSignInButton label="Sign in with ORCID iD" />
            </Box>
          </Box>
        )}
        <Box margin={{ left: '30px' }}>
          <Box gap="small">
            <Text weight="bold">
              Create a BioResources Portal account with your ORCID iD
            </Text>
            <Text>
              You can use your existing ORCID iD to create an BioResources
              Portal account. If you don’t have an ORCID iD, you can use the
              button below to create one!
            </Text>
            <Text>
              You can use your BioResources Portal account to request resources,
              share your resources, and track and manage requests.
            </Text>
            <ORCIDSignInButton label="Create or Connect ORCID iD" />
          </Box>
        </Box>
      </Box>
      <Box
        alignSelf="center"
        height="0px"
        width="large"
        border={[{ size: 'small', side: 'top', color: 'black-tint-95' }]}
      />
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
    </Box>
  )
}

export const CreateAccountLoginButton = ({
  title,
  showSignIn,
  plainButton
}) => {
  const [showing, setShowing] = React.useState(false)

  return (
    <>
      {!plainButton && <LoginButton onClick={() => setShowing(true)} />}
      {plainButton && (
        <Button primary onClick={() => setShowing(true)} label={title} />
      )}
      <Modal showing={showing} setShowing={setShowing}>
        <CreateOrLogin title={title} showSignIn={showSignIn} />
      </Modal>
    </>
  )
}

export default CreateAccountLoginButton
