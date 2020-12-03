import React from 'react'
import Link from 'next/link'
import { Anchor, Button, Box, Text, TextArea, FormField } from 'grommet'
import api from 'api'
import { getReadable } from 'helpers/readableNames'
import getRequestState, {
  getRequestProgressStatuses
} from 'helpers/getRequestStatus'
import getRequesterWillBeAskedToProvide from 'helpers/getRequesterWillBeAskedToProvide'
import getRequestRequirements from 'helpers/getRequestRequirements'
import hasRequestDocuments from 'helpers/hasRequestDocuments'
import { ProgressBar } from 'components/ProgressBar'
import { HeaderRow } from 'components/HeaderRow'
import { ResourceTypeOrganisms } from 'components/resources/ResourceCard'
import { Modal } from 'components/Modal'
import AssignRequestSelect from 'components/AssignRequestSelect'
import DropZone from 'components/DropZone'
import Icon from 'components/Icon'
import { useUser } from 'hooks/useUser'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import DownloadAttachment, {
  PreviewAttachment
} from 'components/DownloadAttachment'
import PreviewAbstract from 'components/PreviewAbstract'
import PreviewAddress from 'components/PreviewAddress'
import PreviewPayment from 'components/PreviewPayment'
import ViewAllRequestDocuments from 'components/ViewAllRequestDocuments'
import RequestAwaitingAdditionalDocuments from 'components/RequestAwaitingAdditionalDocuments'
import RequestMakeArrangements from 'components/RequestMakeArrangements'
import { List, ListItem, NumberMarker } from 'components/List'
import PreviewIssue from 'components/PreviewIssue'

export default ({ request: defaultRequest }) => {
  const { addAlert } = useAlertsQueue()
  const { token } = useUser()
  const { executed_mta_attachment: defaultExecutedMTA } = defaultRequest
  const [request, setRequest] = React.useState(defaultRequest)
  const [showFulfill, setShowFulfill] = React.useState(false)
  const [note, setNote] = React.useState('')
  const [executedMTA, setExecutedMTA] = React.useState(defaultExecutedMTA)
  const [showRejection, setShowRejection] = React.useState(false)
  const {
    material: {
      title: materialTitle,
      contact_user: { full_name: contactName }
    },
    requester
  } = request

  const {
    needsIrb,
    needsMta,
    shippingRequirement: { needsPayment, needsShippingAddress }
  } = getRequestRequirements(request.material)

  const hasDocuments = hasRequestDocuments(request.material)
  const materialLink = `/resources/${request.material.id}`

  const state = getRequestState(request)
  // the states dont represent these special cases
  const fulfilledState =
    state === 'IN_FULFILLMENT_ISSUE_REPORTED' ? 'IN_FULFILLMENT' : state
  const indexState =
    fulfilledState === 'VERIFIED_FULFILLED' ? 'FULFILLED' : fulfilledState
  const progressSteps = getRequestProgressStatuses(request)
  const progressIndex = progressSteps.indexOf(indexState)

  const setStatus = async (status) => {
    const updateRequest = await api.requests.update(
      request.id,
      {
        status
      },
      token
    )
    if (updateRequest.isOk) {
      setRequest(updateRequest.response)
    } else {
      addAlert('Unable to update request', 'error')
    }
  }

  const acceptRequest = () => {
    const status = request.is_missing_requester_documents
      ? 'APPROVED'
      : 'IN_FULFILLMENT'
    setStatus(status)
  }

  const rejectRequest = () => setStatus('REJECTED')

  const markFulfilled = async () => {
    const noteRequest = await api.requests.notes.add(request.id, note, token)
    if (noteRequest.isOk) return setStatus('FULFILLED')
    return addAlert('Unable to add fulfillment note', 'error')
  }

  const submitExecutedMTA = async () => {
    const updates = {}
    if (executedMTA) {
      const { mta_attachment: template } = request.material
      const filename = `executed-${template.filename}`
      const mtaRequest = await api.attachments.create(
        {
          filename,
          file: executedMTA,
          owned_by_org: request.material.organization.id
        },
        token
      )
      if (mtaRequest.isOk) {
        updates.executed_mta_attachment = mtaRequest.response.id
      } else {
        return addAlert('Unable to upload executed MTA', 'error')
      }
    } else {
      return addAlert('Please add executed MTA', 'error')
    }

    updates.status = 'IN_FULFILLMENT'

    const updateRequest = await api.requests.update(request.id, updates, token)
    if (updateRequest.isOk) {
      addAlert('Updated', 'success')
      return setRequest(updateRequest.response)
    }
    return addAlert('Unable to update', 'error')
  }

  const awaitingMtaSteps = []
  if (state === 'AWAITING_MTA') {
    if (needsIrb || needsPayment) {
      awaitingMtaSteps.push(
        'Review the additional documents submitted by the requests'
      )
    }
    awaitingMtaSteps.push('Sign and upload the fully executed MTA')
  }

  const awaitingMtaAndDocuments = awaitingMtaSteps.length > 1

  return (
    <Box pad={{ vertical: 'medium' }}>
      <Box
        direction="row"
        align="center"
        justify="between"
        pad={{ bottom: 'medum' }}
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
          <AssignRequestSelect request={request} />
          <Text textAlign="center" margin={{ top: 'small' }}>
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
          <Box pad={{ bottom: 'large' }}>
            <Text margin={{ left: 'large', bottom: 'medium' }}>
              Please review the material supplied by the requester and make a
              decision.
            </Text>
            <HeaderRow label="Requester Submitted Materials" />
            {!request.requester_abstract && !request.address && (
              <Text color="black-tint-60" italic>
                No submitted materials required.
              </Text>
            )}
            {request.requester_abstract && (
              <PreviewAbstract abstract={request.requester_abstract} />
            )}
            {request.address && <PreviewAddress address={request.address} />}
            <Box
              direction="row"
              gap="medium"
              justify="end"
              margin={{ bottom: 'medium' }}
            >
              <Button
                label="Reject"
                onClick={() => {
                  setShowRejection(true)
                }}
              />
              <Button primary label="Accept" onClick={acceptRequest} />
            </Box>
            {request.is_missing_requester_documents && (
              <Box
                margin={{ bottom: 'medium' }}
                width="medium"
                alignSelf="center"
              >
                <Box direction="row" gap="medium" margin={{ top: 'large' }}>
                  <Icon name="Info" />
                  <Text weight="bold">
                    Requester will be asked to provide{' '}
                    {getRequesterWillBeAskedToProvide(request)} once you accept.
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        )}
        {state === 'AWAITING_ADDITIONAL_DOCUMENTS' && (
          <Box pad={{ bottom: 'large' }}>
            <Text>Waiting for the requester to provide:</Text>
            <RequestAwaitingAdditionalDocuments request={request} />
          </Box>
        )}
        {state === 'AWAITING_MTA' && (
          <>
            <Box pad={{ bottom: 'large' }}>
              <Text>
                {requester.full_name} has submitted the additional documents.
              </Text>
              {awaitingMtaAndDocuments ? (
                <>
                  <Text margin={{ bottom: 'medium' }}>Please:</Text>
                  <Box pad={{ left: 'large' }}>
                    <List>
                      {awaitingMtaSteps.map((d, index) => (
                        <ListItem
                          markerMargin={{ top: 'none', right: 'small' }}
                          marker={<NumberMarker number={index + 1} />}
                        >
                          {d}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </>
              ) : (
                <Text weight="bold">
                  Please{' '}
                  {`${awaitingMtaSteps[0][0].toLowerCase()}${awaitingMtaSteps[0].slice(
                    1
                  )}`}
                </Text>
              )}
            </Box>
            <Box>
              <HeaderRow label="Additional Documents" />
              {needsIrb && (
                <Box margin={{ vertical: 'medium' }}>
                  <DownloadAttachment
                    attachment={request.irb_attachment}
                    label="IRB"
                  />
                </Box>
              )}
              {needsPayment && (
                <Box margin={{ vertical: 'small' }}>
                  <PreviewPayment
                    method={request.payment_method}
                    info={request.payment_method_notes}
                  />
                </Box>
              )}
            </Box>
            <Box>
              <HeaderRow label="Sign and Upload MTA" />
              <Box margin={{ vertical: 'medium' }}>
                <DownloadAttachment
                  label="Requester signed MTA"
                  attachment={request.requester_signed_mta_attachment}
                />
              </Box>
              {executedMTA && (
                <>
                  <Text weight="bold" margin={{ bottom: 'medium' }}>
                    Executed MTA
                  </Text>
                  <Box
                    direction="row"
                    gap="medium"
                    align="center"
                    margin={{ vertical: 'medium' }}
                  >
                    <PreviewAttachment attachment={executedMTA} />
                    <Button
                      plain
                      icon={<Icon name="Cross" size="small" />}
                      label="Remove"
                      onClick={() => {
                        setExecutedMTA()
                      }}
                    />
                  </Box>
                </>
              )}
              {needsMta && !executedMTA && (
                <>
                  <Text weight="bold" margin={{ bottom: 'medium' }}>
                    Sign and Upload the Above File
                  </Text>
                  <DropZone
                    fileTypes={['pdf']}
                    onDrop={(files) => {
                      const [file] = files
                      setExecutedMTA(file)
                    }}
                  />
                </>
              )}
            </Box>
            <Box direction="row" justify="end" margin={{ vertical: 'medium' }}>
              <Button
                primary
                disabled={!executedMTA}
                label="Move to In Fulfillment"
                onClick={submitExecutedMTA}
              />
            </Box>
          </>
        )}
        {['IN_FULFILLMENT', 'IN_FULFILLMENT_ISSUE_REPORTED'].includes(
          state
        ) && (
          <Box>
            {request.has_issues && (
              <>
                <Box
                  direction="row"
                  justify="center"
                  align="center"
                  gap="small"
                >
                  <Icon name="Warning" color="warning" />
                  <Text>
                    {requester.full_name} has reported an issue with sent
                    resources.
                  </Text>
                </Box>
                <Box margin={{ vertical: 'medium' }}>
                  <Text weight="bold">Description of Issue</Text>
                  {request.issues
                    .filter((i) => i.status === 'OPEN')
                    .map((i) => (
                      <PreviewIssue key={i.id} issue={i} />
                    ))}
                  <Box direction="row" width="full" justify="end">
                    <Button
                      as="a"
                      href={`mailto:${requester.email}`}
                      label="Contact Requester"
                    />
                  </Box>
                </Box>
              </>
            )}
            {request.payment_method === 'REIMBURSEMENT' && (
              <RequestMakeArrangements request={request} />
            )}
            <HeaderRow label="Shipping Information" />
            {needsPayment && (
              <Box margin={{ bottom: 'medium' }}>
                <PreviewPayment
                  method={request.payment_method}
                  info={request.payment_method_notes}
                />
              </Box>
            )}
            {needsShippingAddress && (
              <PreviewAddress address={request.address} />
            )}
            <Box direction="row" justify="end">
              <Button
                primary
                label="Mark Fulfilled"
                onClick={() => setShowFulfill(true)}
              />
            </Box>
            <Modal
              showing={showFulfill}
              setShowing={setShowFulfill}
              title="Mark Fulfilled"
            >
              <Box width="medium">
                <FormField
                  label="Add Note"
                  help="Provide tracking info or handling info to request."
                >
                  <TextArea
                    value={note}
                    onChange={({ target: { value } }) => setNote(value)}
                  />
                </FormField>
                <Box direction="row" justify="end">
                  <Button
                    label="Mark Fulfilled"
                    onClick={markFulfilled}
                    disabled={note.length === 0}
                  />
                </Box>
              </Box>
            </Modal>
          </Box>
        )}
        {['FULFILLED', 'VERIFIED_FULFILLED'].includes(state) && (
          <Box direction="row" align="center" pad="medium">
            <Text>This request has been fulfilled.</Text>
          </Box>
        )}
        {hasDocuments && state !== 'OPEN' && (
          <Box margin={{ vertical: 'large' }}>
            <ViewAllRequestDocuments request={request} />
          </Box>
        )}
      </Box>
      <Modal
        showing={showRejection}
        setShowing={setShowRejection}
        title="Reject Request"
      >
        <Box width="large">
          <Text>Confirm you want to reject the request</Text>
          <Box direction="row" justify="end">
            <Button primary label="Reject" onClick={rejectRequest} />
          </Box>
        </Box>
      </Modal>
      {request.is_active_sharer &&
        !['OPEN', 'FULFILLED', 'VERIFIED_FULFILLED'].includes(state) && (
          <Box
            direction="row"
            justify="center"
            align="center"
            gap="medium"
            border={{ side: 'top' }}
            pad={{ vertical: 'large' }}
          >
            <Text weight="bold">Resource can no longer be provided?</Text>
            <Button
              critical
              label="Reject Request"
              onClick={() => setShowRejection(true)}
            />
          </Box>
        )}
    </Box>
  )
}
