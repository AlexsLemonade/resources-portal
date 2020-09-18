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

export default ({ request: defaultRequest }) => {
  const [request, setRequest] = React.useState(defaultRequest)
  const { user, token } = useUser()
  const { addAlert } = useAlertsQueue()
  const {
    material: {
      title: materialTitle,
      contact_user: { email: contactEmail, full_name: contactName }
    }
  } = request

  const materialLink = `/resources/${request.material.id}`

  const state = getRequestState(request)
  const progressSteps = getRequestProgressStatuses(request)
  const progressIndex = progressSteps.indexOf(state)

  const [irbAttachment, setIrbAttachment] = React.useState()
  const [mtaAttachment, setMtaAttachment] = React.useState()
  const [paymentMethod, setPaymentMethod] = React.useState()
  const [paymentDetails, setPaymentDetails] = React.useState()
  const paymentOptions = []
  if (request.material.shipping_requirement) {
    const {
      accepts_shipping_code: shippingCode,
      accepts_reimbursement: reimbursement,
      accepts_other_payment_methods: other
    } = request.material.shipping_requirement
    if (shippingCode)
      paymentOptions.push({ value: 'SHIPPING_CODE', label: 'Shipping Code' })
    if (reimbursement)
      paymentOptions.push({ value: 'REIMBURSEMENT', label: 'Reimbursement' })
    if (other)
      paymentOptions.push({
        value: 'OTHER_PAYMENT_METHOD',
        label: 'Other Payment Method'
      })
  }

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

  const submitAdditionalDocs = async () => {
    const updates = {}
    const needsIRB = request.material.needs_irb
    const irbOk = !needsIRB || irbAttachment
    const needsMTA = request.material.needs_mta
    const mtaOk = !needsMTA || mtaAttachment
    const needsPayment =
      request.material.shipping_requirement &&
      request.material.shipping_requirement.needs_payment
    const paymentOk = !needsPayment || (paymentMethod && paymentDetails)
    if (irbOk && mtaOk && paymentOk) {
      if (needsIRB) {
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
      if (needsMTA) {
        const { mta_attachment: template } = request.materials
        const filename = `requester-signed-${template.filename}`
        const mtaRequest = await api.attachments.create(
          { filename, file: mtaAttachment, owned_by_user: { id: user.id } },
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
    if (!needsMTA) updates.status = 'IN_FULFILLMENT'

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
          <Button
            as="a"
            label="Contact Submitter"
            href={`mailto:${contactEmail}`}
          />
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
              <Text>
                Your request has been accepted on the condition that you provide
                the following materials
              </Text>
              {request.material.needs_irb && <Text>IRB</Text>}
              {request.material.needs_mta && (
                <>
                  <Text>Signed Copy of Material Transfer Agreement (MTA)</Text>
                  <DownloadAttachment
                    attachment={request.material.mta_attachment}
                  />
                </>
              )}
              {request.material.shipping_requirement &&
                request.material.shipping_requirement.needs_payment && (
                  <Text>Shipping Payment Method</Text>
                )}
            </Box>
            <Box>
              {request.material.needs_irb && (
                <Box margin={{ bottom: 'large' }}>
                  <Text>IRB</Text>
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
              {request.material.needs_mta && (
                <Box margin={{ bottom: 'large' }}>
                  <DownloadAttachment
                    attachment={request.material.mta_attachment}
                  />
                  <Text weight="bold">
                    Signed Material Transfer Agreement (MTA)
                  </Text>
                  {mtaAttachment && (
                    <Box direction="row" gap="medium" align="center">
                      <PreviewAttachment attachment={mtaAttachment} />
                      <Button
                        plain
                        icon={<Icon name="Cross" size="small" />}
                        label="Remove"
                        onClick={() => {
                          setMtaAttachment()
                        }}
                      />
                    </Box>
                  )}
                  {!mtaAttachment && (
                    <DropZone
                      fileTypes={['pdf']}
                      onDrop={(files) => {
                        const [file] = files
                        setMtaAttachment(file)
                      }}
                    />
                  )}
                </Box>
              )}
              {request.material.shipping_requirement &&
                request.material.shipping_requirement.needs_payment && (
                  <Box margin={{ bottom: 'medium' }}>
                    <Text margin={{ bottom: 'small' }}>Payment Method</Text>
                    <RadioButtonGroup
                      name="doc"
                      options={paymentOptions}
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
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
          <Box pad={{ bottom: 'large' }}>
            <Text>Waiting for {contactName} to upload fully executed MTA</Text>
          </Box>
        )}
        {state === 'IN_FULFILLMENT' && (
          <Box pad={{ bottom: 'large' }}>
            <Box margin={{ veritcal: 'medium' }}>
              <Text>
                {request.material.organization.name} is working to fulfill your
                request. Your resource should be on the way soon.
              </Text>
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
            <Text>View All Request Materials</Text>
          </Box>
        )}
        {['FULFILLED', 'VERIFIED_FULFILLED'].includes(state) && (
          <>
            <Box pad="medium">
              <Text>
                {request.material.organization.name} has marked your request as
                fulfilled. Please look at the fulfillment note for details.
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
            {state === 'FULFILLED' && (
              <Box
                direction="row"
                gap="medium"
                align="center"
                justify="center"
                margin={{ vertical: 'medium' }}
              >
                <Text>
                  If you have received the resource, please verify that you have
                  received it.
                </Text>
                <Button
                  color="success"
                  label="Verify"
                  onClick={verifyFulfillment}
                />
              </Box>
            )}
          </>
        )}
      </Box>
      {state !== 'FULFILLED' && request.is_active && (
        <Box direction="row" justify="end" gap="medium">
          <Text>No longer interested in this resource?</Text>
          <Button label="Cancel Request" onClick={cancelRequest} />
        </Box>
      )}
    </Box>
  )
}
