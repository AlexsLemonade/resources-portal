import React from 'react'
import { Box, Button, FormField, TextArea, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import { Modal } from 'components/Modal'
import DownloadAttachment from 'components/DownloadAttachment'
import PreviewAddress from 'components/PreviewAddress'
import PreviewPayment from 'components/PreviewPayment'
import RequestInFulfillmentIssueReported from 'components/RequestInFulfillmentIssueReported'
import RequestMakeArrangements from 'components/RequestMakeArrangements'
import useRequest from 'hooks/useRequest'

export default () => {
  const {
    request,
    isRequester,
    requestRequirements,
    markFulfilled
  } = useRequest()
  const {
    shippingRequirement: { needsPayment, needsShippingAddress }
  } = requestRequirements
  const [showFulfill, setShowFulfill] = React.useState(false)
  const [note, setNote] = React.useState('')
  const markFulfilledWithNote = () => markFulfilled(note)

  const {
    has_issues: hasIssues,
    address,
    payment_method: paymentMethod,
    payment_method_notes: paymentNotes,
    executed_mta_attachment: mtaAttachment,
    material: {
      organization: { name: teamName }
    }
  } = request

  if (hasIssues) return <RequestInFulfillmentIssueReported />

  if (isRequester)
    return (
      <Box pad={{ bottom: 'large' }}>
        <Box margin={{ veritcal: 'medium' }}>
          <Text>
            {teamName} is working to fulfill your request. Your resource should
            be on the way soon.
          </Text>
          {paymentMethod === 'REIMBURSEMENT' && <RequestMakeArrangements />}
        </Box>
        {mtaAttachment && (
          <Box margin={{ vertical: 'medium' }}>
            <HeaderRow label="Request Materials" />
            <Text weight="bold">Fully Executed MTA</Text>
            <DownloadAttachment attachment={mtaAttachment} />
          </Box>
        )}
      </Box>
    )

  return (
    <Box>
      <Box margin={{ veritcal: 'medium' }}>
        <Text>
          Please remember to mark this request as fulfilled after sending your
          resource.
        </Text>
      </Box>
      {paymentMethod === 'REIMBURSEMENT' && <RequestMakeArrangements />}
      {(needsPayment || needsShippingAddress) && (
        <HeaderRow label="Shipping Information" />
      )}
      {needsPayment && (
        <Box margin={{ bottom: 'medium' }}>
          <PreviewPayment method={paymentMethod} info={paymentNotes} />
        </Box>
      )}
      {needsShippingAddress && <PreviewAddress address={address} />}
      <Box direction="row" justify="end" margin={{ vertical: 'medium' }}>
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
        <Box width="large">
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
              onClick={markFulfilledWithNote}
              disabled={note.length === 0}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}
