import React from 'react'
import { Box, Text } from 'grommet'
import { List, ListItem } from 'components/List'
import DownloadAttachment from 'components/DownloadAttachment'
import getRequestRequirements from 'helpers/getRequestRequirements'
import useRequest from 'hooks/useRequest'

export default () => {
  const {
    request: { material }
  } = useRequest()
  const {
    needsIrb,
    needsMta,
    mtaAttachment,
    shippingRequirement: { needsPayment }
  } = getRequestRequirements(material)

  return (
    <List margin={{ left: 'large' }}>
      {needsIrb && <ListItem margin={{ bottom: 'medium' }}>IRB</ListItem>}
      {needsMta && (
        <ListItem margin={{ bottom: 'medium' }}>
          <Box>
            <Text margin={{ bottom: 'medium' }}>
              Signed Copy of Material Transfer Agreement (MTA)
            </Text>
            <DownloadAttachment attachment={mtaAttachment} />
          </Box>
        </ListItem>
      )}
      {needsPayment && (
        <ListItem margin={{ bottom: 'medium' }}>
          Shipping Payment Method
        </ListItem>
      )}
    </List>
  )
}
