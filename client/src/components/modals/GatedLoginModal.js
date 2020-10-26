import React from 'react'
import { Box, Stack } from 'grommet'
import CreateOrLogin from 'components/CreateOrLogin'
import styled from 'styled-components'
import { useUser } from 'hooks/useUser'

const LoginBox = styled(Box)`
  backdrop-filter: blur(5px);
`

export const GatedLoginModal = ({ title, children, renderChildren = true }) => {
  const { isLoggedIn } = useUser()

  return (
    <Stack guidingChild="last">
      {(renderChildren || isLoggedIn) && children}
      {!isLoggedIn && (
        <LoginBox align="center" pad="medium" full>
          <Box
            border={[{ color: 'black-tint-95' }]}
            background="white"
            elevation="medium"
            pad="xlarge"
          >
            <CreateOrLogin title={title} showSignIn />
          </Box>
        </LoginBox>
      )}
    </Stack>
  )
}
