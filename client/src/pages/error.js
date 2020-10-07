import { Text } from 'grommet'
import React from 'react'

export const ErrorPage = ({ errorMessage, ...config }) => {
  console.log(config)
  return <Text>{errorMessage}</Text>
}

ErrorPage.getInitialProps = async ({ query }) => {
  return {
    errorMessage: query.error_message
  }
}

export default ErrorPage
