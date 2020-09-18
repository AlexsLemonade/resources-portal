import React from 'react'
import { Box, Text } from 'grommet'

export default ({ abstract }) => {
  return (
    <Box margin={{ bottom: 'medium' }}>
      <Text weight="bold" margin={{ bottom: 'small' }}>
        Abstract
      </Text>
      <Text>{abstract}</Text>
    </Box>
  )
}
