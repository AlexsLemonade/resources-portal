import React from 'react'
import { Box, Text } from 'grommet'

export default ({ label = '', requests = [] }) => {
  return (
    <Box
      elevation="medium"
      pad={{ vertical: 'xlarge', horizontal: 'medium' }}
      align="center"
      basis="1/3"
      justify="center"
    >
      <Text weight="bold" textAlign="center">
        {label}
      </Text>
      <Text size="xlarge" color="brand" margin={{ top: 'small' }}>
        {requests.length}
      </Text>
    </Box>
  )
}
