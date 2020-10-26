import React from 'react'
import { Box, Text } from 'grommet'
import getDateString from 'helpers/getDateString'

export default ({ issue }) => {
  const { description, status, created_at: createdAt } = issue
  const date = new Date(createdAt)
  const isClosed = status === 'CLOSED'
  return (
    <Box direction="row" gap="medium">
      <Text>{getDateString(date)}</Text>
      <Box direction="row">
        {isClosed ? (
          <Text italic>{description} (Closed)</Text>
        ) : (
          <Text>{description}</Text>
        )}
      </Box>
    </Box>
  )
}
