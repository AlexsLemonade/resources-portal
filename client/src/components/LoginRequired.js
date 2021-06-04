import React from 'react'
import { useRouter } from 'next/router'
import { Main, Box, Heading } from 'grommet'
import Header from 'components/Header'
import CreateOrLogin from 'components/CreateOrLogin'
import { useUser } from 'hooks/useUser'
import { CreateUserContextProvider } from 'contexts/CreateUserContext'
import CompleteSignInModal from 'components/CompleteSignInModal'

export default ({
  title = 'Sign In To Access Your Account',
  children,
  showHeader = false
}) => {
  const router = useRouter()
  const { isLoggedIn, refreshUser } = useUser()
  const hasCode = !!router.query.code
  const isResponsePage = router.pathname === '/account'
  const showLoginModal = hasCode && isResponsePage

  React.useEffect(() => {
    if (isLoggedIn) refreshUser()
  }, [])

  if (!isLoggedIn) {
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
            {showLoginModal ? (
              <CreateUserContextProvider>
                <CompleteSignInModal
                  code={router.query.code}
                  clientPath={router.pathname}
                />
              </CreateUserContextProvider>
            ) : (
              <CreateOrLogin />
            )}
          </Box>
        </Main>
      </Box>
    )
  }

  // if user is logged in render child components
  return children
}
