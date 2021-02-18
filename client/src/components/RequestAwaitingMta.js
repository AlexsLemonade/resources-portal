import React from 'react'
import { Box, Text } from 'grommet'
import RequestAwaitingMtaInstructions from 'components/RequestAwaitingMtaInstructions'
import RequestAwaitingMtaForm from 'components/RequestAwaitingMtaForm'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request, isRequester } = useRequest()
  const {
    requester: { full_name: requesterName },
    material: {
      organization: { name: teamName }
    }
  } = request

  if (isRequester)
    return (
      <Box width="full" pad={{ bottom: 'large' }}>
        <Text textAlign="center" margin="none">
          Waiting for {teamName} to review, sign, and upload the MTA.
        </Text>
      </Box>
    )

  return (
    <Box pad={{ bottom: 'large' }}>
      <Text>{requesterName} has submitted the additional documents.</Text>
      <RequestAwaitingMtaInstructions />
      <RequestAwaitingMtaForm />
    </Box>
  )
}
