import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import Icon from 'components/Icon'

export const PreviewAttachment = ({ attachment }) => {
  return (
    <Box direction="row" gap="small">
      <Icon color="black-tint-30" size="medium" name="FilePDF" />
      <Text>{attachment.name}</Text>
    </Box>
  )
}

export default ({ attachment }) => {
  if (!attachment) return 'Empty'
  return (
    <Anchor href={attachment.download_url} target="_blank">
      <Box direction="row" gap="small">
        <Icon color="black-tint-30" size="medium" name="FilePDF" />
        <Text>{attachment.filename}</Text>
      </Box>
    </Anchor>
  )
}
