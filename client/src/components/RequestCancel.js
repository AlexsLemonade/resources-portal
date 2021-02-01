import React from 'react'
import { Box, Button, Text } from 'grommet'
import useRequest from 'hooks/useRequest'

export default () => {
  const { updateStatus } = useRequest()
  const cancelRequest = () => updateStatus('CANCELLED')

  return (
    <Box
      direction="row"
      justify="end"
      align="center"
      gap="medium"
      border={{ side: 'top' }}
      pad={{ vertical: 'large' }}
    >
      <Text weight="bold">No longer interested in this resource?</Text>
      <Button critical label="Cancel Request" onClick={cancelRequest} />
    </Box>
  )
}
