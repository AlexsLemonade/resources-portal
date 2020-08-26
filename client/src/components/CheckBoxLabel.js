import React from 'react'
import { Box, Text } from 'grommet'

export const CheckBoxLabel = ({ label, info }) => {
  return (
    <Box>
      <Text margin={{ top: 'none' }}>{label}</Text>
      <Text color="black-tint-40" size="small">
        {info}
      </Text>
    </Box>
  )
}

export default CheckBoxLabel
