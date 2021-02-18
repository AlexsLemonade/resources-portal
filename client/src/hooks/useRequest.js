import React from 'react'
import { RequestContext } from 'contexts/RequestContext'

import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { useUser } from 'hooks/useUser'
import api from 'api'
import getRequestRequirements from 'helpers/getRequestRequirements'

export default () => {
  const {
    request,
    setRequest,
    refreshRequest,
    isFetched,
    isRequester,
    isSharer
  } = React.useContext(RequestContext)

  const { user, token } = useUser()
  const { addAlert } = useAlertsQueue()

  const requestRequirements = isFetched
    ? getRequestRequirements(request.material)
    : {}

  // Report Issues
  const createIssue = async (issue) => {
    const issueRequest = await api.requests.issues.add(request.id, issue, token)
    if (issueRequest.isOk) {
      refreshRequest()
      return addAlert('Issue reported', 'success')
    }
    addAlert('Error reporting issue', 'error')
    return issueRequest
  }

  const updateStatus = async (status) => {
    const updateRequest = await api.requests.update(
      request.id,
      { status },
      token
    )

    if (updateRequest.isOk) {
      refreshRequest()
      return addAlert('Updated Request', 'success')
    }
    return addAlert('Unable to update request', 'error')
  }

  // TODO: handle partially successful calls intelligently
  const submitAdditionalDocuments = async ({
    irbAttachment,
    requesterMtaAttachment,
    paymentMethod,
    paymentDetails
  }) => {
    const {
      needsIrb,
      needsMta,
      shippingRequirement: { needsPayment },
      mtaAttachment
    } = requestRequirements
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
      refreshRequest()
      return addAlert('Documents successfully updated', 'success')
    }
    return addAlert('Unable to update', 'error')
  }

  const rejectRequestWithReason = async (reason) => {
    const updates = {
      rejection_reason: reason,
      status: 'REJECTED'
    }
    const rejectRequest = await api.requests.update(request.id, updates, token)
    if (rejectRequest.isOk) {
      refreshRequest()
      return addAlert('Request Rejected', 'success')
    }
    return addAlert('Unable to reject request', 'error')
  }

  const markFulfilled = async (note) => {
    const noteRequest = await api.requests.notes.add(request.id, note, token)
    if (noteRequest.isOk) return updateStatus('FULFILLED')
    return addAlert('Unable to add fulfillment note', 'error')
  }

  const submitExecutedMTA = async (executedMTA) => {
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
      refreshRequest()
      return addAlert('Document successfully updated', 'success')
    }
    return addAlert('Unable to update', 'error')
  }

  return {
    request,
    setRequest,
    requestRequirements,
    refreshRequest,
    isFetched,
    isRequester,
    isSharer,
    submitAdditionalDocuments,
    submitExecutedMTA,
    markFulfilled,
    rejectRequestWithReason,
    createIssue,
    updateStatus
  }
}
