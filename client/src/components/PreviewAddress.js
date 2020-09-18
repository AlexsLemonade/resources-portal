import React from 'react'
import { Box, Text } from 'grommet'

export default ({ address, label = 'Shipping Address' }) => {
  return (
    <Box margin={{ bottom: 'medium' }}>
      <Text weight="bold" margin={{ bottom: 'small' }}>
        {label}
      </Text>
      <Text>{address.name}</Text>
      <Text>{address.institution}</Text>
      <Text>{address.address_line_1}</Text>
      <Text>{address.address_line_2}</Text>
      <Text>
        {address.locality}, {address.state}, {address.postal_code}
      </Text>
      <Text>{address.country}</Text>
    </Box>
  )
}
