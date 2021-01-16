import React from 'react'
import { Box, Text, Anchor } from 'grommet'
import Icon from 'components/Icon'

export default ({ url }) => {
  return (
    <Box direction="row" gap="small" align="center">
      <Icon name="Warning" color="warning" />
      <Box>
        <Text size="small">
          Please verify that the following link is correct before continuing.
        </Text>
        <Anchor size="small" target="_blank" href={url} label={url} />
      </Box>
    </Box>
  )
}
