import React from 'react'
import { Box, Text } from 'grommet'
import Icon from 'components/Icon'

export default ({ message = 'Required' }) => {
  return (
    <Box direction="row" gap="xsmall" align="center">
      <Icon name="Warning" color="error" size="medium" />
      <Text color="error" size="12px" margin={{ top: '2px' }}>
        {message}
      </Text>
    </Box>
  )
}
