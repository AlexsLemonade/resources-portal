import React from 'react'
import { Box, Text, Paragraph } from 'grommet'
import getDateString from 'helpers/getDateString'

export default ({ note }) => {
  const { text, created_at: createdAt } = note
  const date = new Date(createdAt)
  return (
    <Box direction="row" gap="medium">
      <Text>{getDateString(date)}</Text>
      <Box direction="row">
        {text.split('\r').map((p) => (
          <Paragraph key={p}>{p}</Paragraph>
        ))}
      </Box>
    </Box>
  )
}
