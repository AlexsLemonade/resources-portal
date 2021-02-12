import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import Icon from 'components/Icon'
import { List, ListItem } from 'components/List'
import getRequestRequirements from 'helpers/getRequestRequirements'

const ReviewRequestRequirement = ({ title, children }) => {
  return (
    <Box direction="row" gap="medium" margin={{ bottom: 'medium' }}>
      <Box width="280px">
        <Text textAlign="end" weight="bold">
          {title}
        </Text>
      </Box>
      {children || <Text>Required</Text>}
    </Box>
  )
}

export const ReviewRequestRequirements = ({ resource }) => {
  const {
    mtaAttachment,
    needsAbstract,
    needsIRB,
    hasShippingRequirement,
    shippingRequirement: {
      needsPayment,
      needsShippingAddress,
      acceptsShippingCode,
      acceptsReimbursement,
      acceptsOtherPaymentMethods,
      sharerPaysShipping,
      restrictions
    }
  } = getRequestRequirements(resource)

  const hasBeforeRequestRequirements = needsAbstract || !!hasShippingRequirement
  const hasAfterRequestRequirements =
    !!mtaAttachment || needsIRB || sharerPaysShipping === false
  const hasRequestRequirements =
    hasBeforeRequestRequirements || hasAfterRequestRequirements

  return (
    <Box>
      {!hasRequestRequirements && (
        <ReviewRequestRequirement title="Request Requirments">
          <Text italic>No Request Requirements</Text>
        </ReviewRequestRequirement>
      )}
      {mtaAttachment && (
        <ReviewRequestRequirement title="Material Transfer Agreement (MTA)">
          <Box direction="row" gap="small">
            <Icon color="black-tint-30" size="medium" name="FilePDF" />
            <Text>{mtaAttachment.filename}</Text>
          </Box>
        </ReviewRequestRequirement>
      )}
      {needsIRB && <ReviewRequestRequirement title="IRB" />}
      {needsAbstract && <ReviewRequestRequirement title="Abstract" />}
      {hasShippingRequirement && (
        <ReviewRequestRequirement title="Shipping Information">
          <Box>
            {needsShippingAddress && (
              <Text margin={{ bottom: 'small' }}>Shipping Address</Text>
            )}
            <Text weight="bold" margin={{ bottom: 'small' }}>
              Shipping Method
            </Text>
            {needsPayment && sharerPaysShipping ? (
              <Text weight="bold">You are responsible for shipping costs.</Text>
            ) : (
              <>
                <Text>
                  Requester is responsible for shipping costs through one of the
                  following methods:
                </Text>
                {acceptsShippingCode && (
                  <ListItem
                    margin={{ bottom: 'small' }}
                    marker="ring"
                    text="Shipping Code"
                  />
                )}
                {acceptsReimbursement && (
                  <ListItem
                    margin={{ bottom: 'small' }}
                    marker="ring"
                    text="Shipping Costs Reimbursement"
                  />
                )}
                {acceptsOtherPaymentMethods && (
                  <ListItem
                    margin={{ bottom: 'small' }}
                    marker="ring"
                    text="Accepts Other Payment Methods"
                  />
                )}
              </>
            )}
            {restrictions && (
              <Box>
                <Text weight="bold">Restrictions</Text>
                {restrictions}
              </Box>
            )}
          </Box>
        </ReviewRequestRequirement>
      )}
    </Box>
  )
}

export const RequestRequirements = ({ resource, oneSection = false }) => {
  const {
    organization: { name: teamName }
  } = resource

  const {
    hasRequirements,
    mtaAttachment,
    needsAbstract,
    needsIRB,
    hasShippingRequirement,
    shippingRequirement: {
      needsPayment,
      needsShippingAddress,
      acceptsShippingCode,
      acceptsReimbursement,
      acceptsOtherPaymentMethods,
      sharerPaysShipping,
      restrictions
    }
  } = getRequestRequirements(resource)

  const hasBeforeRequestRequirements = needsAbstract || !!hasShippingRequirement
  const hasAfterRequestRequirements =
    !!mtaAttachment || needsIRB || sharerPaysShipping === false

  return (
    <Box gap="medium">
      {!hasRequirements && (
        <Text italic color="black-tint-40">
          {teamName} does not require you to submit any materials to make a
          request.
        </Text>
      )}
      {hasBeforeRequestRequirements && (
        <>
          {!oneSection && (
            <Box direction="row" gap="small">
              <Icon color="plain" size="40px" name="List" />
              <Text>
                Below are a list of items you will need to request this
                resource:
              </Text>
            </Box>
          )}
          <Box>
            <List pad={{ left: 'xlarge' }}>
              {needsAbstract && (
                <ListItem
                  title="Abstract"
                  text="A brief description of your project."
                />
              )}
              {hasShippingRequirement && (
                <ListItem title="Shipping Information">
                  <List margin={{ top: '8px' }}>
                    {needsShippingAddress && (
                      <ListItem marker="ring" title="Receiving Address" />
                    )}
                    {restrictions && restrictions.length && (
                      <ListItem
                        marker="ring"
                        title="Restrictions"
                        text={restrictions}
                      />
                    )}
                  </List>
                </ListItem>
              )}
            </List>
          </Box>
        </>
      )}
      {hasAfterRequestRequirements && (
        <>
          <Box>
            {!oneSection && (
              <Box direction="row" gap="small">
                <Icon color="plain" size="40px" name="Later" />
                <Text>
                  Once your request is approved, you will need to do the
                  following:
                </Text>
              </Box>
            )}
            <List pad={{ left: 'xlarge' }}>
              {needsIRB && (
                <ListItem
                  title="IRB Approval"
                  text="A copy of your IRB approval."
                />
              )}
              {mtaAttachment && (
                <ListItem title="Sign and upload the Material Transfer Agreement (MTA)">
                  <Box direction="row" gap="medium" margin={{ top: 'medium' }}>
                    <Icon color="black-tint-30" size="medium" name="FilePDF" />
                    <Anchor
                      href={mtaAttachment.download_url}
                      label={mtaAttachment.filename}
                    />
                  </Box>
                </ListItem>
              )}
              {hasShippingRequirement && (
                <ListItem title="Shipping Information">
                  <List margin={{ top: '8px' }}>
                    {needsPayment && (
                      <ListItem marker="ring" title="Needs Payment" />
                    )}
                    {acceptsShippingCode && (
                      <ListItem
                        marker="ring"
                        title="Accepts Shipping Codes (possible restrictions apply)"
                      />
                    )}
                    {acceptsReimbursement && (
                      <ListItem
                        marker="ring"
                        title="Accepts Reimbursement for shipping costs"
                      />
                    )}
                    {acceptsOtherPaymentMethods && (
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
        </>
      )}
    </Box>
  )
}
