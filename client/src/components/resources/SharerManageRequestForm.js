import React from 'react'
import Link from 'next/link'
import { Anchor, Button, Box, Text, TextArea, FormField } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import getRequestState, {
  getRequestProgressStatuses
} from 'helpers/getRequestStatus'
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
import api from 'api'

export default ({ request: defaultRequest }) => {
  const [showFulfill, setShowFulfill] = React.useState(false)
  const [note, setNote] = React.useState('')
  const { executed_mta_attachment: defaultExecutedMTA } = defaultRequest
  const [executedMTA, setExecutedMTA] = React.useState(defaultExecutedMTA)
  const { addAlert } = useAlertsQueue()
  const [request, setRequest] = React.useState(defaultRequest)
  const [showRejection, setShowRejection] = React.useState(false)
  const { token } = useUser()
  const {
    material: {
      title: materialTitle,
      contact_user: { full_name: contactName }
    },
    requester
  } = request

  const materialLink = `/resources/${request.material.id}`

  const state = getRequestState(request)
  const progressSteps = getRequestProgressStatuses(request)
  const progressIndex = progressSteps.indexOf(state)

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

  return (
    <Box>
      <Box
        direction="row"
        justify="between"
        pad={{ bottom: 'medum' }}
        border={{ side: 'bottom' }}
        margin={{ bottom: 'large' }}
      >
        <Box>
          <Text>{contactName}</Text>
          <Link href={materialLink}>
            <Anchor href={materialLink} label={materialTitle} />
          </Link>
          <ResourceTypeOrganisms resource={request.material} />
        </Box>
        <Box>
          <AssignRequestSelect request={request} />
        </Box>
      </Box>

      <Box
        pad={{ bottom: 'medum' }}
        border={{ side: 'bottom' }}
        margin={{ bottom: 'large' }}
      >
        <Box margin={{ bottom: 'large' }}>
          <ProgressBar
            steps={progressSteps.map(getReadable)}
            index={progressIndex}
          />
        </Box>
        <Text size="large">{getReadable(state)}</Text>
        {state === 'OPEN' && (
          <Box pad={{ bottom: 'large' }}>
            <Text margin={{ bottom: 'medium' }}>
              Please review the material supplied by the requester and make a
              decision.
            </Text>
            {request.is_missing_requester_documents && (
              <Box>
                <Text weight="bold">Requester will be asked to provide:</Text>
                {request.material.needs_irb && <Text>IRB</Text>}
                {request.material.needs_mta && <Text>Signed MTA</Text>}
                {request.material.shipping_requirement &&
                  request.material.shipping_requirement.needs_payment && (
                    <Text>Shipping Payment Info</Text>
                  )}
              </Box>
            )}
            <HeaderRow label="Requester Submitted Materials" />
            {request.requester_abstract && (
              <PreviewAbstract abstract={request.requester_abstract} />
            )}
            {request.address && <PreviewAddress address={request.address} />}
            <Box direction="row" gap="medium" justify="end">
              <Button
                label="Reject"
                onClick={() => {
                  setShowRejection(true)
                }}
              />
              <Button primary label="Accept" onClick={acceptRequest} />
            </Box>
          </Box>
        )}
        {state === 'AWAITING_ADDITIONAL_DOCUMENTS' && (
          <>
            <Box pad={{ bottom: 'large' }}>
              <Text>Waiting for the requester to provide:</Text>
              {request.material.needs_irb && <Text>IRB</Text>}
              {request.material.needs_mta && (
                <Text>Signed Copy of Material Transfer Agreement (MTA)</Text>
              )}
              {request.material.shipping_requirement &&
                request.material.shipping_requirement.needs_payment && (
                  <Text>Shipping Payment Method</Text>
                )}
            </Box>
            <Box>
              {request.requester_abstract && (
                <PreviewAbstract abstract={request.requester_abstract} />
              )}
              {request.address && <PreviewAddress address={request.address} />}
            </Box>
          </>
        )}
        {state === 'AWAITING_MTA' && (
          <>
            <Box pad={{ bottom: 'large' }}>
              <Text>
                {requester.full_name} has submitted the additional documents.
              </Text>
              <Text>Please:</Text>
              <Text>
                Review the additional documents submitted by the requests
              </Text>
              <Text>Sign and upload the requester signed MTA</Text>
            </Box>
            <Box>
              <HeaderRow label="Additional Documents" />
              Shipping payment method Shipping payment info
            </Box>
            <Box>
              <HeaderRow label="Sign and Upload MTA" />
              <Box margin={{ vertical: 'medium' }}>
                <Text weight="bold">Requester signed MTA</Text>
                <DownloadAttachment
                  attachment={request.requester_signed_mta_attachment}
                />
              </Box>
              {executedMTA && (
                <>
                  <Text weight="bold">Executed MTA</Text>
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
              {!executedMTA && (
                <DropZone
                  fileTypes={['pdf']}
                  onDrop={(files) => {
                    const [file] = files
                    setExecutedMTA(file)
                  }}
                />
              )}
            </Box>
            <Box direction="row" justify="end" margin={{ vertical: 'medium' }}>
              <Button
                primary
                disabled={!executedMTA}
                label="Move to In Fulfilmment"
                onClick={submitExecutedMTA}
              />
            </Box>
            <Box>
              {request.requester_abstract && (
                <PreviewAbstract abstract={request.requester_abstract} />
              )}
              {request.address && <PreviewAddress address={request.address} />}
            </Box>
          </>
        )}
        {state === 'IN_FULFILLMENT' && (
          <Box>
            <HeaderRow label="Shipping Information" />
            <PreviewPayment
              method={request.requester_payment_method}
              info={request.requester_payment_method_info}
            />
            <PreviewAddress address={request.address} />
            <Text>View All Request Materials</Text>
            <PreviewAddress address={request.address} />
            <Text>IRB</Text>
            <DownloadAttachment attachment={request.irb_attachment} />
            <Text>Requester Signed MTA</Text>
            <DownloadAttachment
              attachment={request.requester_signed_mta_attachment}
            />
            <Text>Executed MTA</Text>
            <DownloadAttachment attachment={request.executed_mta_attachment} />
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
      {request.is_active && (
        <Box direction="row" justify="end" gap="medium">
          <Text>Is this resource no longer available?</Text>
          <Button
            label="Reject Request"
            onClick={() => setShowRejection(true)}
          />
        </Box>
      )}
    </Box>
  )
}
