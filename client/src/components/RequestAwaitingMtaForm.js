import React from 'react'
import { Box, Button, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import Icon from 'components/Icon'
import DropZone from 'components/DropZone'
import DownloadAttachment, {
  PreviewAttachment
} from 'components/DownloadAttachment'
import PreviewPayment from 'components/PreviewPayment'

import useRequest from 'hooks/useRequest'

export default () => {
  const { request, requestRequirements, submitExecutedMTA } = useRequest()
  const { executed_mta_attachment: defaultExecutedMTA } = request
  const [executedMTA, setExecutedMTA] = React.useState(defaultExecutedMTA)
  const {
    needsIrb,
    needsMta,
    shippingRequirement: { needsPayment }
  } = requestRequirements

  return (
    <>
      {(needsIrb || needsPayment) && (
        <Box>
          <HeaderRow label="Additional Documents" />
          {needsIrb && (
            <Box margin={{ vertical: 'medium' }}>
              <DownloadAttachment
                attachment={request.irb_attachment}
                label="IRB Approval"
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
      )}
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
          onClick={() => submitExecutedMTA(executedMTA)}
        />
      </Box>
    </>
  )
}
