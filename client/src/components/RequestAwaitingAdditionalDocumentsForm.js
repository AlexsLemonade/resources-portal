import React from 'react'
import { Box, Text, FormField, TextArea, RadioButtonGroup } from 'grommet'
import Button from 'components/Button'
import getPaymentOptions from 'helpers/getPaymentOptions'
import DropZone from 'components/DropZone'
import { InfoCard } from 'components/InfoCard'
import Icon from 'components/Icon'
import DownloadAttachment, {
  PreviewAttachment
} from 'components/DownloadAttachment'
import useRequest from 'hooks/useRequest'

export default () => {
  const {
    request,
    requestRequirements,
    submitAdditionalDocuments
  } = useRequest()

  const {
    material: {
      organization: { name: team }
    }
  } = request

  const [irbAttachment, setIrbAttachment] = React.useState()
  const [requesterMtaAttachment, setRequesterMtaAttachment] = React.useState()
  const [paymentMethod, setPaymentMethod] = React.useState()
  const [paymentDetails, setPaymentDetails] = React.useState()

  const {
    needsIrb,
    needsMta,
    shippingRequirement: { needsPayment, restrictions },
    mtaAttachment
  } = requestRequirements

  return (
    <Box>
      {needsIrb && (
        <Box margin={{ bottom: 'large' }}>
          <Text weight="bold" margin={{ bottom: 'medium' }}>
            Upload IRB Approval
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
              fileTypes={['pdf', 'docx', 'doc', 'txt']}
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
          {restrictions && restrictions.length > 0 && (
            <Box align="center" margin={{ vertical: 'medium' }}>
              <InfoCard type="Warning" color="warning">
                <Text weight="bold">Shipping Restrictions</Text>
                <Text>{restrictions}</Text>
              </InfoCard>
            </Box>
          )}
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
          <FormField
            label="Payment Details"
            help={`Do not enter banking information here. Contact ${team} directly if you need to provide that information`}
          >
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
        <Button
          primary
          label="Submit"
          onClick={async () => {
            await submitAdditionalDocuments({
              irbAttachment,
              requesterMtaAttachment,
              paymentMethod,
              paymentDetails
            })
          }}
        />
      </Box>
    </Box>
  )
}
