import React from 'react'
import { Box, Button, Grommet, Text } from 'grommet'
import { useRouter } from 'next/router'
import theme from 'theme'

const ErrorPage = ({ sentry = {} }) => {
  const router = useRouter()

  const { eventId } = sentry

  React.useEffect(() => {
    const forceRefresh = (url) => {
      window.location = url
    }

    router.events.on('routeChangeStart', forceRefresh)
  }, [])

  const goBack = () => {
    router.back()
  }

  return (
    <Grommet theme={theme} full>
      <Box justify="center" fill>
        <Box direction="row">
          <Box align="center" width="full">
            <Text size="xlarge" margin={{ bottom: 'large' }}>
              Uh oh, something happened.
            </Text>
            <Text>
              We have been notified and are taking a look at the issue.
            </Text>
            {eventId && (
              <Box margin={{ vertical: 'medium' }}>
                <Text size="small" color="error" round="small">
                  Error ID: {eventId}
                </Text>
              </Box>
            )}
            <Box direction="row" justify="center" width="full">
              <Button primary label="Go Back" onClick={goBack} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Grommet>
  )
}

ErrorPage.getInitialProps = async ({ query }) => {
  return {
    errorMessage: query.error_message
  }
}

export default ErrorPage
