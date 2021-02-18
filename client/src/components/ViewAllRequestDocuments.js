import React from 'react'
import { Box, Button, Text } from 'grommet'
import { Modal } from 'components/Modal'
import { HeaderRow } from 'components/HeaderRow'
import DownloadAttachment from 'components/DownloadAttachment'
import PreviewAbstract from 'components/PreviewAbstract'
import PreviewAddress from 'components/PreviewAddress'
import PreviewPayment from 'components/PreviewPayment'
import PreviewIssue from 'components/PreviewIssue'
import PreviewFulfillmentNote from 'components/PreviewFulfillmentNote'
import getRequestRequirements from 'helpers/getRequestRequirements'

export default ({ request }) => {
  const [showing, setShowing] = React.useState(false)
  const {
    needsMta,
    needsAbstract,
    needsIrb,
    hasShippingRequirement,
    shippingRequirement: { needsShippingAddress, needsPayment }
  } = getRequestRequirements(request.material)
  const needsRequesterDocuments =
    needsMta ||
    needsAbstract ||
    needsIrb ||
    needsPayment ||
    needsShippingAddress
  const hasFulfillmentNotes = request.fulfillment_notes.length > 0
  const hasIssues = request.issues.length > 0

  return (
    <>
      <Button
        plain
        label="View All Request Documents"
        onClick={() => setShowing(true)}
      />
      <Modal
        showing={showing}
        setShowing={setShowing}
        title="View All Request Documents"
      >
        <Box height="fill" width="large">
          {needsMta && (
            <Box margin={{ bottom: 'medium' }}>
              <DownloadAttachment
                label="Fully Executed MTA"
                attachment={request.executed_mta_attachment}
                emptyMessage="Fully executed MTA has not been uploded."
              />
            </Box>
          )}
          {needsRequesterDocuments && (
            <Box margin={{ bottom: 'medium' }}>
              <HeaderRow label="Requester Supplied Documents" />
              {needsAbstract && (
                <PreviewAbstract abstract={request.requester_abstract} />
              )}
              {needsIrb && (
                <Box margin={{ bottom: 'medium' }}>
                  <DownloadAttachment
                    label="IRB Approval"
                    attachment={request.irb_attachment}
                    emptyMessage="IRB Approval has not been uploaded."
                  />
                </Box>
              )}
              {hasShippingRequirement && needsShippingAddress && (
                <PreviewAddress address={request.address} />
              )}
              {hasShippingRequirement && needsPayment && (
                <Box margin={{ bottom: 'medium' }}>
                  <PreviewPayment
                    request={request}
                    method={request.payment_method}
                    info={request.payment_method_notes}
                  />
                </Box>
              )}
              {needsMta && (
                <Box margin={{ bottom: 'medium' }}>
                  <DownloadAttachment
                    label="Partially Signed MTA"
                    attachment={request.requester_signed_mta_attachment}
                    emptyMessage="Partially signed MTA has not been uploaded"
                  />
                </Box>
              )}
              <HeaderRow label="Other Request Materials" />

              <Box margin={{ bottom: 'medium' }}>
                <Text weight="bold">Fulfillment Notes</Text>
                {hasFulfillmentNotes ? (
                  request.fulfillment_notes.map((note) => (
                    <PreviewFulfillmentNote key={note.id} note={note} />
                  ))
                ) : (
                  <Text color="black-tint-60" italic>
                    No Fulfillment Notes
                  </Text>
                )}
              </Box>

              <Box margin={{ bottom: 'medium' }}>
                <Text weight="bold">Requester Reported Issues</Text>
                {hasIssues ? (
                  request.issues.map((issue) => (
                    <PreviewIssue key={issue.id} issue={issue} />
                  ))
                ) : (
                  <Text color="black-tint-60" italic>
                    No Issues Reported
                  </Text>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  )
}
