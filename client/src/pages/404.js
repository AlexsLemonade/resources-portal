import React from 'react'
import { Box, Button, Text } from 'grommet'
import Image from '../images/404.svg'

export default () => {
  return (
    <Box direction="row" justify="center" fill>
      <Box direction="row" justify="center" align="center">
        <Box align="start" width="full">
          <Text size="xlarge" margin={{ bottom: 'large' }}>
            This page does not exist.
          </Text>
          <Button primary label="Go Back" />
        </Box>
        <Image />
      </Box>
    </Box>
  )
}
