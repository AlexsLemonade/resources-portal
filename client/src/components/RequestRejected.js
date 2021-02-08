import React from 'react'
import { Box, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request, isRequester } = useRequest()
  const {
    rejection_reason: reason,
    material: {
      organization: { name: teamName }
    }
  } = request
  const hasReason = reason && reason.length > 0

  if (isRequester)
    return (
      <Box>
        <Text margin={{ left: 'large' }}>
          {teamName} has rejected this request.
        </Text>
        {hasReason && (
          <Box margin={{ vertical: 'medium' }}>
            <HeaderRow label="Rejection Reason" />
            <Box width="medium">
              <Text margin={{ vertical: 'medium' }}>
                {request.rejection_reason}
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    )

  return (
    <Box>
      <Text margin={{ left: 'large' }}>This request was rejected.</Text>
      {hasReason && (
        <Box margin={{ vertical: 'medium' }}>
          <HeaderRow label="Rejection Reason" />
          <Box width="medium">
            <Text margin={{ vertical: 'medium' }}>
              {request.rejection_reason}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
