import React from 'react'
import { Box, Text } from 'grommet'
import useRequest from 'hooks/useRequest'

export default () => {
  const {
    request: {
      material: {
        organization: { name: teamName }
      }
    }
  } = useRequest()

  return (
    <Box width="full" pad={{ bottom: 'large' }}>
      <Text textAlign="center" margin="none">
        Waiting for {teamName} to review, sign, and upload the MTA.
      </Text>
    </Box>
  )
}
