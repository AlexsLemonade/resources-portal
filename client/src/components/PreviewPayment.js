import React from 'react'
import { Box, Text } from 'grommet'
import { getReadable } from 'helpers/readableNames'

export default ({
  title = 'Shipping Payment Method',
  method = '',
  info = ''
}) => {
  const hasMethod = Boolean(method)
  const hasInfo = Boolean(info)
  return (
    <Box>
      <Text weight="bold" margin={{ bottom: 'medium' }}>
        {title}
      </Text>
      {hasMethod ? (
        <Text>{getReadable(method)}</Text>
      ) : (
        <Text color="black-tint-60" italic>
          No payment method set
        </Text>
      )}
      {hasInfo ? (
        <Text>{info}</Text>
      ) : (
        <Text color="black-tint-60" italic>
          No payment info provided
        </Text>
      )}
    </Box>
  )
}
