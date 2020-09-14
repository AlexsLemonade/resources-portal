import React from 'react'
import { Box, Text } from 'grommet'

export const HeaderRow = ({ label }) => {
  return (
    <Box direction="row" align="center" margin={{ vertical: 'medium' }}>
      <Text weight={600} color="brand">
        {label}
      </Text>
      <Box
        background="brand"
        margin={{ left: '4px', top: '4px' }}
        flex="grow"
        height="2px"
      />
    </Box>
  )
}

export default HeaderRow
