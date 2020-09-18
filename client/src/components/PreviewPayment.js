import React from 'react'
import { Box, Text } from 'grommet'

export default ({
  title = 'Shipping Payment Method',
  method = '',
  info = ''
}) => {
  return (
    <Box>
      <Text weight="bold">{title}</Text>
      <Text>{method}</Text>
      <Text>{info}</Text>
    </Box>
  )
}
