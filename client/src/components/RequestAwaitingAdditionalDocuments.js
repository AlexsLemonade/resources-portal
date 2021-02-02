import React from 'react'
import { Box, Text } from 'grommet'
import RequestAwaitingAdditionalDocumentsList from 'components/RequestAwaitingAdditionalDocumentsList'
import RequestAwaitingAdditionalDocumentsForm from 'components/RequestAwaitingAdditionalDocumentsForm'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request } = useRequest()

  return (
    <>
      <Box pad={{ bottom: 'large' }}>
        <Text margin={{ bottom: 'medium' }}>
          Your request has been accepted on the condition that you provide the
          following materials
        </Text>
        <RequestAwaitingAdditionalDocumentsList request={request} />
      </Box>
      <RequestAwaitingAdditionalDocumentsForm />
    </>
  )
}
