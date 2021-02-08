import React from 'react'
import { Box, Text } from 'grommet'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request, isRequester } = useRequest()
  const {
    requester: { full_name: requesterName }
  } = request

  if (isRequester)
    return (
      <Box>
        <Text margin={{ left: 'large' }}>This request was cancelled.</Text>
      </Box>
    )

  return (
    <Box>
      <Text margin={{ left: 'large' }}>
        {requesterName} has cancelled this request.
      </Text>
    </Box>
  )
}
