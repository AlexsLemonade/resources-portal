import React from 'react'
import { Box, Button, Text } from 'grommet'
import useRequest from 'hooks/useRequest'

export default () => {
  const { updateStatus } = useRequest()
  const verifyFulfillment = () => updateStatus('VERIFIED_FULFILLED')

  return (
    <Box
      direction="row"
      gap="medium"
      align="center"
      justify="center"
      margin={{ vertical: 'medium' }}
      border={{ side: 'top', color: 'border-black', size: 'small' }}
      pad={{ vertical: 'medium' }}
    >
      <Text>
        If you have received the resource, please verify that you have received
        it.
      </Text>
      <Button success label="Verify" onClick={verifyFulfillment} />
    </Box>
  )
}
