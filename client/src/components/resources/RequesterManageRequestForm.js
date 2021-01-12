import React from 'react'
import Link from 'next/link'
import {
  Anchor,
  Button,
  Box,
  FormField,
  RadioButtonGroup,
  Text,
  TextArea
} from 'grommet'
import { getReadable } from 'helpers/readableNames'
import getRequestState, {
  getRequestProgressStatuses
} from 'helpers/getRequestStatus'
import { ProgressBar } from 'components/ProgressBar'
import { HeaderRow } from 'components/HeaderRow'
import Icon from 'components/Icon'
import { ResourceTypeOrganisms } from 'components/resources/ResourceCard'
import DropZone from 'components/DropZone'
import DownloadAttachment, {
  PreviewAttachment
} from 'components/DownloadAttachment'
import PreviewAbstract from 'components/PreviewAbstract'
import PreviewAddress from 'components/PreviewAddress'

import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { useUser } from 'hooks/useUser'
import api from 'api'
import ViewAllRequestDocuments from 'components/ViewAllRequestDocuments'
import hasRequestDocuments from 'helpers/hasRequestDocuments'
import RequestAwaitingAdditionalDocuments from 'components/RequestAwaitingAdditionalDocuments'
import getRequestRequirements from 'helpers/getRequestRequirements'
import getPaymentOptions from 'helpers/getPaymentOptions'
import RequestMakeArrangements from 'components/RequestMakeArrangements'
import { Modal } from 'components/Modal'

export default ({ request: defaultRequest }) => {
  const [request, setRequest] = React.useState(defaultRequest)
  const hasDocuments = hasRequestDocuments(request.material)
  const { user, token } = useUser()
  const { addAlert } = useAlertsQueue()
  const {
    material: {
      title: materialTitle,
      contact_user: { email: contactEmail, full_name: contactName },
      organization: team
    }
  } = request

  const {
    needsIrb,
    needsMta,
    shippingRequirement: { needsPayment },
    mtaAttachment
  } = getRequestRequirements(request.material)

  const materialLink = `/resources/${request.material.id}`

  const state = getRequestState(request)
  const progressSteps = getRequestProgressStatuses(request)
  const progressIndex = progressSteps.indexOf(state)

  // Report Issues
  const [showReportModal, setShowReportModal] = React.useState(false)
  const [issue, setIssue] = React.useState('')
  const sendIssue = async () => {
    setShowReportModal(false)
    const issueRequest = await api.requests.issues.add(request.id, issue, token)
    if (issueRequest.isOk) {
      setIssue('')
      addAlert('Issue reported', 'success')
      refreshRequest()
    } else {
      addAlert('Error reporting issue', 'error')
      setShowReportModal(true)
    }
  }

  const [irbAttachment, setIrbAttachment] = React.useState()
  const [requesterMtaAttachment, setRequesterMtaAttachment] = React.useState()
  const [paymentMethod, setPaymentMethod] = React.useState()
  const [paymentDetails, setPaymentDetails] = React.useState()
  const canCancel =
    request.is_active_requester &&
    !['IN_FULFILLMENT', 'FULFILLED', 'VERIFIED_FULFILLED'].includes(state)

  const updateStatus = async (status) => {
    const updateRequest = await api.requests.update(
      request.id,
      { status },
      token
    )
    if (updateRequest.isOk) setRequest(updateRequest.response)
    if (!updateRequest.isOk) addAlert('Unable to update request', 'error')
  }

  const cancelRequest = () => updateStatus('CANCELLED')
  const verifyFulfillment = () => updateStatus('VERIFIED_FULFILLED')

  const refreshRequest = async () => {
    const requestRequest = await api.requests.get(request.id, token)
    if (requestRequest.isOk) {
      setRequest(requestRequest.response)
    }
  }

  const submitAdditionalDocs = async () => {
    const updates = {}
    const irbOk = !needsIrb || irbAttachment
    const mtaOk = !needsMta || requesterMtaAttachment
    const paymentOk = !needsPayment || (paymentMethod && paymentDetails)
    if (irbOk && mtaOk && paymentOk) {
      if (needsIrb) {
        const irbRequest = await api.attachments.create(
          { file: irbAttachment, owned_by_user: { id: user.id } },
          token
        )
        if (irbRequest.isOk) {
          updates.irb_attachment = irbRequest.response.id
        } else {
          return addAlert('Unable to upload IRB', 'error')
        }
      }
      if (needsMta) {
        const filename = `requester-signed-${mtaAttachment.filename}`
        const mtaRequest = await api.attachments.create(
          {
            filename,
            file: requesterMtaAttachment,
            owned_by_user: { id: user.id }
          },
          token
        )
        if (mtaRequest.isOk) {
          updates.requester_signed_mta_attachment = mtaRequest.response.id
        } else {
          return addAlert('Unable to upload signed MTA', 'error')
        }
      }
      if (needsPayment) {
        updates.payment_method = paymentMethod
        updates.payment_method_notes = paymentDetails
      }
    } else {
      return addAlert('Please complete all fields.', 'error')
    }

    // this should probably be performed on the API
    if (!needsMta) updates.status = 'IN_FULFILLMENT'

    const updateRequest = await api.requests.update(request.id, updates, token)
    if (updateRequest.isOk) {
      addAlert('Updated', 'success')
      return setRequest(updateRequest.response)
    }
    return addAlert('Unable to update', 'error')
  }

  return (
    <Box pad={{ vertical: 'medium' }}>
      <Box
        direction="row"
        align="center"
        justify="between"
        pad={{ bottom: 'medium' }}
        margin={{ bottom: 'large' }}
      >
        <Box gap="medium">
          <Text>{contactName}</Text>
          <Link href={materialLink}>
            <Anchor href={materialLink} label={materialTitle} />
          </Link>
          <ResourceTypeOrganisms resource={request.material} />
        </Box>
        <Box>
          {!['FULFILLED', 'VERIFIED_FULFILLED'].includes(state) && (
            <Button
              as="a"
              label="Contact Submitter"
              href={`mailto:${contactEmail}`}
              margin={{ bottom: 'small' }}
            />
          )}
          <Text italic color="black-tint-40" textAlign="center">
            {request.human_readable_created_at}
          </Text>
        </Box>
      </Box>

      <Box pad={{ bottom: 'medum' }} margin={{ bottom: 'large' }}>
        <Box margin={{ bottom: 'large' }}>
          <ProgressBar
            steps={progressSteps.map(getReadable)}
            index={progressIndex}
          />
        </Box>
        <Text size="large" serif margin={{ bottom: 'medium' }}>
          {state === 'OPEN' ? 'Open Request' : getReadable(state)}
        </Text>
        {state === 'OPEN' && (
          <Box pad={{ veritcal: 'large' }}>
            <HeaderRow label="Submitted Materials" />
            {request.requester_abstract && (
              <PreviewAbstract abstract={request.requester_abstract} />
            )}
            {request.address && <PreviewAddress address={request.address} />}
          </Box>
        )}
        {state === 'AWAITING_ADDITIONAL_DOCUMENTS' && (
          <>
            <Box pad={{ bottom: 'large' }}>
              <Text margin={{ bottom: 'medium' }}>
                Your request has been accepted on the condition that you provide
                the following materials
              </Text>
              <RequestAwaitingAdditionalDocuments request={request} />
            </Box>
            <Box>
              {request.material.needs_irb && (
                <Box margin={{ bottom: 'large' }}>
                  <Text weight="bold" margin={{ bottom: 'medium' }}>
                    Upload IRB
                  </Text>
                  {irbAttachment && (
                    <Box direction="row" gap="medium" align="center">
                      <PreviewAttachment attachment={irbAttachment} />
                      <Button
                        plain
                        icon={<Icon name="Cross" size="small" />}
                        label="Remove"
                        onClick={() => {
                          setIrbAttachment()
                        }}
                      />
                    </Box>
                  )}

                  {!irbAttachment && (
                    <DropZone
                      fileTypes={['docx', 'doc', 'txt']}
                      onDrop={(files) => {
                        const [file] = files
                        setIrbAttachment(file)
                      }}
                    />
                  )}
                </Box>
              )}
              {needsMta && (
                <Box margin={{ bottom: 'large' }}>
                  <Box margin={{ bottom: 'medium' }}>
                    <DownloadAttachment
                      label="Unsigned MTA Attachment"
                      attachment={mtaAttachment}
                    />
                  </Box>
                  <Text weight="bold" margin={{ bottom: 'medium' }}>
                    Signed Material Transfer Agreement (MTA)
                  </Text>
                  {requesterMtaAttachment && (
                    <Box direction="row" gap="medium" align="center">
                      <PreviewAttachment attachment={requesterMtaAttachment} />
                      <Button
                        plain
                        icon={<Icon name="Cross" size="small" />}
                        label="Remove"
                        onClick={() => {
                          setRequesterMtaAttachment()
                        }}
                      />
                    </Box>
                  )}
                  {!requesterMtaAttachment && (
                    <DropZone
                      fileTypes={['pdf']}
                      onDrop={(files) => {
                        const [file] = files
                        setRequesterMtaAttachment(file)
                      }}
                    />
                  )}
                </Box>
              )}
              {needsPayment && (
                <Box margin={{ bottom: 'medium' }}>
                  <Text weight="bold" margin={{ bottom: 'small' }}>
                    Payment Method
                  </Text>
                  <RadioButtonGroup
                    name="payment-method"
                    options={getPaymentOptions(request)}
                    value={paymentMethod}
                    onChange={({ target: { value } }) => {
                      setPaymentMethod(value)
                    }}
                  />
                  <FormField label="Payment Details">
                    <TextArea
                      value={paymentDetails}
                      onChange={({ target: { value } }) => {
                        setPaymentDetails(value)
                      }}
                    />
                  </FormField>
                </Box>
              )}
              <Box direction="row" justify="end" margin={{ bottom: 'medium' }}>
                <Button primary label="Submit" onClick={submitAdditionalDocs} />
              </Box>
            </Box>
          </>
        )}
        {state === 'AWAITING_MTA' && (
          <Box width="full" pad={{ bottom: 'large' }}>
            <Text textAlign="center" margin="none">
              Waiting for {team.name} to review, sign, and upload the MTA.
            </Text>
          </Box>
        )}
        {['IN_FULFILLMENT', 'IN_FULFILLMENT_ISSUE_REPORTED'].includes(
          state
        ) && (
          <Box pad={{ bottom: 'large' }}>
            <Box margin={{ veritcal: 'medium' }}>
              <Text>
                {team.name} is working to fulfill your request. Your resource
                should be on the way soon.
              </Text>
              {request.payment_method === 'REIMBURSEMENT' && (
                <RequestMakeArrangements request={request} requesterView />
              )}
            </Box>
            {request.executed_mta_attachment && (
              <Box margin={{ vertical: 'medium' }}>
                <HeaderRow label="Request Materials" />
                <Text weight="bold">Fully Executed MTA</Text>
                <DownloadAttachment
                  attachment={request.executed_mta_attachment}
                />
              </Box>
            )}
          </Box>
        )}
        {['FULFILLED', 'VERIFIED_FULFILLED'].includes(state) && (
          <>
            <Box pad={{ bottom: 'large' }}>
              <Text textAlign="center">
                {team.name} has marked your request as fulfilled. Please look at
                the fulfillment note for details.
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
        )}
        {hasDocuments && state !== 'OPEN' && (
          <Box margin={{ vertical: 'large' }}>
            <ViewAllRequestDocuments request={request} />
          </Box>
        )}
        {state === 'FULFILLED' && (
          <Box
            direction="row"
            gap="medium"
            align="center"
            justify="center"
            margin={{ vertical: 'medium' }}
            border={{ side: 'top', color: 'border-black', size: 'small' }}
            pad={{ vertical: 'medium' }}
          >
            <Text>
              If you have received the resource, please verify that you have
              received it.
            </Text>
            <Button success label="Verify" onClick={verifyFulfillment} />
          </Box>
        )}
      </Box>
      {canCancel && (
        <Box
          direction="row"
          justify="end"
          align="center"
          gap="medium"
          border={{ side: 'top' }}
          pad={{ vertical: 'large' }}
        >
          <Text weight="bold">No longer interested in this resource?</Text>
          <Button critical label="Cancel Request" onClick={cancelRequest} />
        </Box>
      )}
      {state === 'FULFILLED' && (
        <Box pad={{ bottom: 'large' }}>
          <Modal
            title="Report Issue with Resource"
            showing={showReportModal}
            setShowing={setShowReportModal}
          >
            <FormField label="Please describe the issue in detail below.">
              <TextArea
                value={issue}
                onChange={({ target: { value } }) => setIssue(value)}
              />
            </FormField>
            <Box direction="row" justify="end">
              <Button label="Send" onClick={sendIssue} />
            </Box>
          </Modal>
          <Text textAlign="center">
            Problem with received resources?{' '}
            <Button
              plain
              label={`Let ${team.name} know`}
              onClick={() => setShowReportModal(true)}
            />
          </Text>
        </Box>
      )}
    </Box>
  )
}
