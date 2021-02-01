import React from 'react'
import { Box } from 'grommet'
import { ProgressBar } from 'components/ProgressBar'
import RequestHero from 'components/RequestHero'
import RequestTitle from 'components/RequestTitle'
import ViewAllRequestDocuments from 'components/ViewAllRequestDocuments'
import RequestAwaitingAdditionalDocuments from 'components/RequestAwaitingAdditionalDocuments'
import RequestInFulfillment from 'components/RequestInFulfillment'
import RequestOpen from 'components/RequestOpen'
import RequestReportIssue from 'components/RequestReportIssue'
import RequestCancel from 'components/RequestCancel'
import RequestFulfilled from 'components/RequestFulfilled'
import RequestFulfilledVerified from 'components/RequestFulfilledVerified'
import RequestVerifyFulfillment from 'components/RequestVerifyFulfillment'
import RequestAwaitingMta from 'components/RequestAwaitingMta'
import useRequest from 'hooks/useRequest'
import hasRequestDocuments from 'helpers/hasRequestDocuments'
import getRequestStatus, {
  getRequestProgressState
} from 'helpers/getRequestStatus'
import { getReadable } from 'helpers/readableNames'

export default () => {
  const { request } = useRequest()

  const state = getRequestStatus(request)
  const { progressSteps, currentStep, currentIndex } = getRequestProgressState(
    request
  )

  const hasDocuments = hasRequestDocuments(request.material)
  const canViewAllDocuments = hasDocuments && state !== 'OPEN'
  const canCancel =
    request.is_active_requester &&
    !['IN_FULFILLMENT', 'FULFILLED', 'VERIFIED_FULFILLED'].includes(state)
  const canVerify = state === 'FULFILLED'
  const canReportIssue = state === 'FULFILLED'

  return (
    <Box pad={{ vertical: 'medium' }}>
      <RequestHero />
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
        {currentStep === 'VERIFIED_FULFILLED' && <RequestFulfilledVerified />}
        {canViewAllDocuments && (
          <Box margin={{ vertical: 'large' }}>
            <ViewAllRequestDocuments request={request} />
          </Box>
        )}
        {canVerify && <RequestVerifyFulfillment />}
      </Box>
      {canCancel && <RequestCancel />}
      {canReportIssue && <RequestReportIssue />}
    </Box>
  )
}
