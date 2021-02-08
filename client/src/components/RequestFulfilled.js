import React from 'react'
import { Box, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import RequestFulfilledVerified from 'components/RequestFulfilledVerified'
import useRequest from 'hooks/useRequest'
import getRequestStatus from 'helpers/getRequestStatus'
import PreviewFulfillmentNote from 'components/PreviewFulfillmentNote'

export default () => {
  const { request, isRequester } = useRequest()
  const state = getRequestStatus(request)
  // show the verified state
  if (state === 'VERIFIED_FULFILLED') return <RequestFulfilledVerified />

  if (isRequester)
    return (
      <>
        <Box pad={{ bottom: 'large' }}>
          <Text textAlign="center">
            {request.material.organization.name} has marked your request as
            fulfilled. Please look at the fulfillment note for details.
          </Text>
        </Box>
        <Box margin={{ vertical: 'medium' }}>
          <HeaderRow label="Request Materials" />
          <Text weight="bold">Fulfullment Note</Text>
          {request.fulfillment_notes.map((note) => (
            <PreviewFulfillmentNote key={note.id} note={note} />
          ))}
          {request.fulfillment_notes.length === 0 && (
            <Text color="black-tint-60" italic>
              There are no notes.
            </Text>
          )}
        </Box>
      </>
    )

  return (
    <Box direction="row" align="center" pad="medium">
      <Text>This request has been fulfilled.</Text>
    </Box>
  )
}
