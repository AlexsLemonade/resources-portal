import React from 'react'
import { Box, Text } from 'grommet'
import RequestResourceContact from 'components/RequestResourceContact'
import RequestTitle from 'components/RequestTitle'
import RequestReject from 'components/RequestReject'
import RequestOpen from 'components/RequestOpen'
import RequestAwaitingMta from 'components/RequestAwaitingMta'
import RequestAwaitingAdditionalDocuments from 'components/RequestAwaitingAdditionalDocuments'
import RequestInFulfillment from 'components/RequestInFulfillment'
import RequestFulfilled from 'components/RequestFulfilled'
import { ProgressBar } from 'components/ProgressBar'
import ViewAllRequestDocuments from 'components/ViewAllRequestDocuments'
import { getReadable } from 'helpers/readableNames'
import { getRequestProgressState } from 'helpers/getRequestStatus'
import hasRequestDocuments from 'helpers/hasRequestDocuments'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request } = useRequest()
  const { progressSteps, currentStep, currentIndex } = getRequestProgressState(
    request
  )
  const hasDocuments = hasRequestDocuments(request.material)
  // this is for the reject at the bottom of the page
  const canRejectSteps = ['AWAITING_MTA', 'IN_FULFILLMENT']
  const canReject = canRejectSteps.includes(currentStep)

  return (
    <Box pad={{ vertical: 'medium' }}>
      <RequestResourceContact />
      <Box pad={{ bottom: 'medum' }} margin={{ bottom: 'large' }}>
        <Box margin={{ bottom: 'large' }}>
          <ProgressBar
            steps={progressSteps.map(getReadable)}
            index={currentIndex}
          />
        </Box>
        <RequestTitle />
        {currentStep === 'OPEN' && <RequestOpen />}
        {currentStep === 'AWAITING_ADDITIONAL_DOCUMENTS' && (
          <RequestAwaitingAdditionalDocuments />
        )}
        {currentStep === 'AWAITING_MTA' && <RequestAwaitingMta />}
        {currentStep === 'IN_FULFILLMENT' && <RequestInFulfillment />}
        {currentStep === 'FULFILLED' && <RequestFulfilled />}
        {hasDocuments && currentStep !== 'OPEN' && (
          <Box margin={{ vertical: 'large' }}>
            <ViewAllRequestDocuments request={request} />
          </Box>
        )}
      </Box>
      {canReject && (
        <Box
          direction="row"
          justify="center"
          align="center"
          gap="medium"
          border={{ side: 'top' }}
          pad={{ vertical: 'large' }}
        >
          <Text weight="bold">Resource can no longer be provided?</Text>
          <RequestReject />
        </Box>
      )}
    </Box>
  )
}
