import React from 'react'
import { Box } from 'grommet'
import { ProgressBar } from 'components/ProgressBar'
import RequestResourceContact from 'components/RequestResourceContact'
import RequestTitle from 'components/RequestTitle'
import RequestOpen from 'components/RequestOpen'
import RequestAwaitingAdditionalDocuments from 'components/RequestAwaitingAdditionalDocuments'
import RequestAwaitingMta from 'components/RequestAwaitingMta'
import RequestInFulfillment from 'components/RequestInFulfillment'
import RequestFulfilled from 'components/RequestFulfilled'
import ViewAllRequestDocuments from 'components/ViewAllRequestDocuments'
import RequestVerifyFulfillment from 'components/RequestVerifyFulfillment'
import RequestCancel from 'components/RequestCancel'
import RequestReportIssue from 'components/RequestReportIssue'
import useRequest from 'hooks/useRequest'
import hasRequestDocuments from 'helpers/hasRequestDocuments'
import { getRequestProgressState } from 'helpers/getRequestStatus'
import { getReadable } from 'helpers/readableNames'

export default () => {
  const { request } = useRequest()
  const { progressSteps, currentStep, currentIndex } = getRequestProgressState(
    request
  )

  const hasDocuments = hasRequestDocuments(request.material)
  const canViewAllDocuments = hasDocuments && currentStep !== 'OPEN'
  const canCancelSteps = ['OPEN', 'AWAITING_ADDITIONAL_DOCUMENTS']
  const canCancel = canCancelSteps.includes(currentStep)
  const canVerify = request.status === 'FULFILLED'
  const canReportIssue = request.status === 'FULFILLED'

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
