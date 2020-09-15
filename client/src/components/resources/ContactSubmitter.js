import React from 'react'
import { Anchor, Box, Text, Stack } from 'grommet'
import { CreateOrLogin } from 'components/CreateAccountLoginButton'
import styled from 'styled-components'
import { useUser } from 'hooks/useUser'

const LoginBox = styled(Box)`
  backdrop-filter: blur(5px);
`

export const ContactSubmitter = ({ resource }) => {
  // check if logged in
  // TODO: authenticate calls
  const { contact_user: contactUser } = resource

  const { isLoggedIn } = useUser()

  return (
    <Box>
      <Text>
        Contact {contactUser.full_name} with questions about the resource.
      </Text>
      <Stack guidingChild="last">
        <Box
          margin={{ vertical: 'medium', left: isLoggedIn ? 'none' : 'small' }}
        >
          <Text weight="bold">Email</Text>
          <Anchor
            label={contactUser.email}
            href={`mailto:${contactUser.email}`}
          />
        </Box>
        {!isLoggedIn && (
          <LoginBox align="center" pad="medium" full>
            <Box
              border={[{ color: 'black-tint-95' }]}
              background="white"
              elevation="medium"
              pad="xlarge"
            >
              <CreateOrLogin
                title="Please sign in to contact submitter"
                showSignIn
              />
            </Box>
          </LoginBox>
        )}
      </Stack>
    </Box>
  )
}
