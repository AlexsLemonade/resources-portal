import React from 'react'
import { Box, Text } from 'grommet'
import { Loader } from 'components/Loader'
import { ProgressBar } from 'components/ProgressBar'
import RequestResourceContact from 'components/RequestResourceContact'
import RequestTitle from 'components/RequestTitle'
import RequestReject from 'components/RequestReject'
import RequestRejected from 'components/RequestRejected'
import RequestCancelled from 'components/RequestCancelled'
import RequestOpen from 'components/RequestOpen'
import RequestAwaitingAdditionalDocuments from 'components/RequestAwaitingAdditionalDocuments'
import RequestAwaitingMta from 'components/RequestAwaitingMta'
import RequestInFulfillment from 'components/RequestInFulfillment'
import RequestFulfilled from 'components/RequestFulfilled'
import RequestInactivePrompt from 'components/RequestInactivePrompt'
import ViewAllRequestDocuments from 'components/ViewAllRequestDocuments'
import RequestVerifyFulfillment from 'components/RequestVerifyFulfillment'
import RequestCancel from 'components/RequestCancel'
import RequestReportIssue from 'components/RequestReportIssue'
import useRequest from 'hooks/useRequest'
import isDaysOld from 'helpers/isDaysOld'
import hasRequestDocuments from 'helpers/hasRequestDocuments'
import { getRequestProgressState } from 'helpers/getRequestStatus'
import { getReadable } from 'helpers/readableNames'

export default () => {
  const { isFetched, isRequester, request } = useRequest()
  if (!isFetched) return <Loader />

  const { progressSteps, currentStep, currentIndex } = getRequestProgressState(
    request
  )
  const hasDocuments = hasRequestDocuments(request.material)
  const canViewAllDocuments = hasDocuments && currentStep !== 'OPEN'
  const canCancelSteps = ['OPEN', 'AWAITING_ADDITIONAL_DOCUMENTS']
  const canCancel = isRequester && canCancelSteps.includes(currentStep)
  const canVerify = isRequester && request.status === 'FULFILLED'
  const canReportIssue = isRequester && request.status === 'FULFILLED'
  const canRejectSteps = ['AWAITING_MTA', 'IN_FULFILLMENT']
  // note: the RequestOpen component has it's own reject button
  const canReject = !isRequester && canRejectSteps.includes(currentStep)

  const { status } = request

  const isStale =
    isDaysOld(request.updated_at, 1) && currentStep !== 'FULFILLED'

  return (
    <Box pad={{ vertical: 'medium' }}>
      <RequestResourceContact />
      {isStale && (
        <Box pad={{ bottom: 'large' }} align="center">
          <RequestInactivePrompt />
        </Box>
      )}
      <Box pad={{ bottom: 'medum' }} margin={{ bottom: 'large' }}>
        <Box margin={{ bottom: 'large' }}>
          <ProgressBar
            steps={progressSteps.map(getReadable)}
            index={currentIndex}
          />
        </Box>
        <RequestTitle />
        {status === 'REJECTED' && <RequestRejected />}
        {status === 'CANCELLED' && <RequestCancelled />}
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
      </Box>
      {canVerify && <RequestVerifyFulfillment />}
      {canCancel && <RequestCancel />}
      {canReportIssue && <RequestReportIssue />}
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
