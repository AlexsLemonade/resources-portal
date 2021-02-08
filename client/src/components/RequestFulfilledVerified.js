import React from 'react'
import { Box, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import useRequest from 'hooks/useRequest'
import PreviewFulfillmentNote from 'components/PreviewFulfillmentNote'

export default () => {
  const { request, isRequester } = useRequest()
  const {
    fulfillment_notes: notes,
    requester: { full_name: requesterName }
  } = request

  if (isRequester)
    return (
      <>
        <Box pad={{ bottom: 'large' }}>
          <Text textAlign="center">
            You have confirmed reciept of this resource. Please look at the
            fulfillment note for details.
          </Text>
        </Box>
        <Box margin={{ vertical: 'medium' }}>
          <HeaderRow label="Request Materials" />
          <Text weight="bold">Fulfullment Note</Text>
          {notes.map((note) => (
            <PreviewFulfillmentNote key={note.id} note={note} />
          ))}
          {notes.length === 0 && (
            <Text color="black-tint-60" italic>
              There are no notes.
            </Text>
          )}
        </Box>
      </>
    )

  return (
    <Box direction="row" align="center" pad="medium">
      <Text>{requesterName} has confirmed the receipt of this resource.</Text>
    </Box>
  )
}
