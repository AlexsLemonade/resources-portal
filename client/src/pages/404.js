import React from 'react'
import { useRouter } from 'next/router'
import { Box, Button, Text } from 'grommet'
import Image from '../images/404.svg'

export default () => {
  const router = useRouter()
  return (
    <Box direction="row" justify="center" fill>
      <Box direction="row" justify="center" align="center">
        <Box align="start" width="full">
          <Text size="xlarge" margin={{ bottom: 'large' }}>
            This page does not exist.
          </Text>
          <Button primary label="Go Back" onClick={() => router.back()} />
        </Box>
        <Image />
      </Box>
    </Box>
  )
}
