import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import Icon from 'components/Icon'
import { List, ListItem } from '../List'

export const RequestRequirements = ({ resource }) => {
  const {
    needs_abstract: needsAbstract,
    needs_mta: needsMTA,
    needs_irb: needsIRB,
    shipping_requirements: shippingRequirements
  } = resource
  return (
    <Box>
      <Box direction="row" gap="small">
        <Icon color="plain" size="40px" name="List" />
        <Text>
          Below are a list of items you will need to request this resource:
        </Text>
      </Box>
      <Box>
        <List pad={{ left: 'xlarge' }}>
          {needsAbstract && (
            <ListItem
              title="Abstract"
              text="A brief description of your project."
            />
          )}
          {shippingRequirements && (
            <ListItem title="Shipping Information">
              <List margin={{ top: '8px' }}>
                {shippingRequirements.needs_shipping_address && (
                  <ListItem marker="ring" title="Receiving Address" />
                )}
                {shippingRequirements.restrictions.length && (
                  <ListItem
                    marker="ring"
                    title="Restrictions"
                    text={shippingRequirements.restrictions}
                  />
                )}
              </List>
            </ListItem>
          )}
        </List>
      </Box>
      <Box>
        <Box direction="row" gap="small">
          <Icon color="plain" size="40px" name="Later" />
          <Text>
            Once your request is approved, you will need to do the following:
          </Text>
        </Box>
        <List pad={{ left: 'xlarge' }}>
          {needsIRB && (
            <ListItem
              title="IRB Approval"
              text="A copy of your IRB approval."
            />
          )}
          {needsMTA && (
            <ListItem title="Sign and upload the Material Transfer Agreement (MTA)">
              <Box direction="row" gap="medium" margin={{ top: 'medium' }}>
                <Icon color="black-tint-30" size="medium" name="FilePDF" />
                <Anchor
                  href={resource.mta_attachment.download_url}
                  label={resource.mta_attachment.filename}
                />
              </Box>
            </ListItem>
          )}
          {shippingRequirements && (
            <ListItem title="Shipping Information">
              <List margin={{ top: '8px' }}>
                {shippingRequirements.needs_payment && (
                  <ListItem marker="ring" title="Needs Payment" />
                )}
                {shippingRequirements.accepts_code && (
                  <ListItem
                    marker="ring"
                    title="Accepts Shipping Codes (possible restrictions apply)"
                  />
                )}
                {shippingRequirements.accepts_reimbursement && (
                  <ListItem
                    marker="ring"
                    title="Accepts Reimbursement for shipping costs"
                  />
                )}
                {shippingRequirements.accepts_other_payment_methods && (
                  <ListItem
                    marker="ring"
                    title="Accepts Other Payment Methods"
                  />
                )}
              </List>
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  )
}
