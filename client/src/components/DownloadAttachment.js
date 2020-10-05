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

export default ({ label, attachment, emptyMessage = 'Not set' }) => {
  if (!attachment) {
    if (!emptyMessage) return false
    return (
      <>
        {label && (
          <Text weight="bold" margin={{ bottom: 'medium' }}>
            {label}
          </Text>
        )}
        <Text color="black-tint-60" italic>
          {emptyMessage}
        </Text>
      </>
    )
  }
  return (
    <>
      {label && (
        <Text weight="bold" margin={{ bottom: 'medium' }}>
          {label}
        </Text>
      )}
      <Anchor href={attachment.download_url} target="_blank">
        <Box direction="row" gap="small">
          <Icon color="black-tint-30" size="medium" name="FilePDF" />
          <Text>{attachment.filename}</Text>
        </Box>
      </Anchor>
    </>
  )
}
