import React from 'react'
import { Box, Paragraph, Text } from 'grommet'
import CreateAccountLoginButton from 'components/CreateAccountLoginButton'

export default () => (
  <Box>
    <Box background="brand" pad={{ vertical: '66px' }}>
      <Box alignSelf="center" align="center" width={{ max: 'large' }}>
        <Text size="50px" color="white">
          Create a CCRR portal account!
        </Text>
        <Paragraph color="white" margin={{ top: 'large' }}>
          You can use your existing ORCID iD to create an CCRR Portal account.
          If you don’t have an ORCID iD, you can use the button below to create
          one!
        </Paragraph>
        <Paragraph color="white" margin={{ top: 'medium' }}>
          You can use your CCRR Portal account to request resources, share your
          resources, and track and manage requests.
        </Paragraph>
        <CreateAccountLoginButton
          title="Create or Connect ORCID iD"
          buttonLabel="Create or Connect ORCID iD"
        />
      </Box>
    </Box>
  </Box>
)
