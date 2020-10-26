import React from 'react'
import { useRouter } from 'next/router'
import { Main, Box, Heading } from 'grommet'
import Header from 'components/Header'
import CreateOrLogin from 'components/CreateOrLogin'
import { useUser } from 'hooks/useUser'

// dont show account section show a login screen
export default ({
  title = 'Sign In To Access Your Account',
  children,
  showHeader = false
}) => {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const hasCode = !!router.query.code
  const isResponsePage = router.pathname === '/account'

  if (!isLoggedIn && !(hasCode && isResponsePage)) {
    return (
      <Box height={{ min: '100vh' }}>
        {showHeader && (
          <Box margin={{ bottom: 'xlarge' }}>
            <Header />
          </Box>
        )}
        <Main width="xxlarge" alignSelf="center" overflow="visible">
          <Heading serif level={4} margin={{ vertical: 'small' }}>
            {title}
          </Heading>
          <Box fill align="center" justify="center">
            <CreateOrLogin />
          </Box>
        </Main>
      </Box>
    )
  }

  return children
}
