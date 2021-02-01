import React from 'react'
import { Box, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import DownloadAttachment from 'components/DownloadAttachment'
import useRequest from 'hooks/useRequest'
import RequestMakeArrangements from 'components/RequestMakeArrangements'

export default () => {
  const { request, isRequester } = useRequest()

  return (
    <Box pad={{ bottom: 'large' }}>
      <Box margin={{ veritcal: 'medium' }}>
        <Text>
          {request.material.organization.name} is working to fulfill your
          request. Your resource should be on the way soon.
        </Text>
        {request.payment_method === 'REIMBURSEMENT' && (
          <RequestMakeArrangements
            request={request}
            requesterView={isRequester}
          />
        )}
      </Box>
      {request.executed_mta_attachment && (
        <Box margin={{ vertical: 'medium' }}>
          <HeaderRow label="Request Materials" />
          <Text weight="bold">Fully Executed MTA</Text>
          <DownloadAttachment attachment={request.executed_mta_attachment} />
        </Box>
      )}
    </Box>
  )
}
