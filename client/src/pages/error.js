import React from 'react'
import { Box, Button, Text } from 'grommet'
import { useRouter } from 'next/router'

export const ErrorPage = ({ errorMessage, eventId }) => {
  const router = useRouter()
  return (
    <Box direction="row" justify="center" fill>
      <Box direction="row" justify="center" align="center">
        <Box align="start" width="full">
          <Text size="xlarge" margin={{ bottom: 'large' }}>
            Uh oh, something happened.
          </Text>
          {errorMessage && <Text>{errorMessage}</Text>}
          {eventId && (
            <Text size="small" color="critical" round="small">
              Error ID: {eventId}
            </Text>
          )}
          <Button primary label="Go Back" onClick={() => router.back()} />
        </Box>
      </Box>
    </Box>
  )
}

ErrorPage.getInitialProps = async ({ query }) => {
  return {
    errorMessage: query.error_message
  }
}

export default ErrorPage
