import React from 'react'
import { Box, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request } = useRequest()

  return (
    <>
      <Box pad={{ bottom: 'large' }}>
        <Text textAlign="center">
          {request.organization.name} has marked your request as fulfilled.
          Please look at the fulfillment note for details.
        </Text>
      </Box>
      <Box margin={{ vertical: 'medium' }}>
        <HeaderRow label="Request Materials" />
        <Text weight="bold">Fulfullment Note</Text>
        {request.fulfillment_notes.map((note) => (
          <Text key={note.id}>{note.text}</Text>
        ))}
        {request.fulfillment_notes.length === 0 && (
          <Text color="black-tint-60" italic>
            There are no notes.
          </Text>
        )}
      </Box>
    </>
  )
}
