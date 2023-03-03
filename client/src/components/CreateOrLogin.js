import React from 'react'
import { Anchor, Box, Heading, Paragraph, Text } from 'grommet'
import ORCIDSignInButton from 'components/ORCIDSignInButton'
import { InfoCard } from 'components/InfoCard'
import Link from 'components/Link'

export default ({ title, showSignIn = true }) => {
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
      <Box>
        <InfoCard elevation="none">
          <Paragraph>
            <Text weight="bold">ALSF Grantees:</Text> Please contact the{' '}
            <Link
              href="mailto:grants@alexslemonade.org?subject=CCRR:%20Invite%20Link%20Request"
              label="ALSF Grants team"
            />{' '}
            for an invite link to sign up. Using the invite link ensures that
            your grants are correctly linked to your account.
          </Paragraph>
        </InfoCard>
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
              Create a CCRR Portal account with your ORCID iD
            </Text>
            <Text>
              You can use your existing ORCID iD to create an CCRR Portal
              account. If you don’t have an ORCID iD, you can use the button
              below to create one!
            </Text>
            <Text>
              You can use your CCRR Portal account to request resources, share
              your resources, and track and manage requests.
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
            target="_blank"
            href="https://orcid.org/"
            label="Learn more at orcid.org"
          />
        </Box>
      </Box>
    </Box>
  )
}
