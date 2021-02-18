import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import Popover from 'components/Popover'
import getRequestRequirements from 'helpers/getRequestRequirements'

const ShippingRequirementPopover = ({ shippingRequirement }) => {
  const {
    sharerPaysShipping,
    acceptsOtherPaymentMethods,
    acceptsReimbursement,
    acceptsShippingCode,
    acceptedPaymentDetails,
    needsShippingAddress,
    restrictions
  } = shippingRequirement

  return (
    <Popover label="Shipping Requirement">
      <>
        <Text weight="bold">Requires:</Text>
        <Box pad={{ left: 'small' }}>
          {sharerPaysShipping && <Text>Sharer Pays Shipping</Text>}
          {acceptsReimbursement && <Text>Reimbursement</Text>}
          {acceptsShippingCode && <Text>Shipping Code</Text>}
          {acceptsOtherPaymentMethods && <Text>Other Payment Method</Text>}
          {needsShippingAddress && <Text>Shipping Address</Text>}
        </Box>
        {acceptedPaymentDetails && (
          <>
            <Text weight="bold">Accepted Payment Details:</Text>
            <Box pad={{ left: 'small' }}>
              <Text>{acceptedPaymentDetails}</Text>
            </Box>
          </>
        )}
        {restrictions && (
          <>
            <Text weight="bold">Restrictions:</Text>
            <Box pad={{ left: 'small' }}>
              <Text>{restrictions}</Text>
            </Box>
          </>
        )}
      </>
    </Popover>
  )
}

export default ({ resource }) => {
  const {
    needsMta,
    mtaAttachment,
    needsAbstract,
    needsIrb,
    hasShippingRequirement,
    shippingRequirement
  } = getRequestRequirements(resource)

  const list = [
    needsAbstract && 'Project Abstract',
    needsIrb && 'IRB',
    needsMta && (
      <Anchor
        href={mtaAttachment.download_url}
        target="_blank"
        rel="noopener noreferrer"
        label="Material Transfer Agreement"
      />
    ),
    hasShippingRequirement && (
      <ShippingRequirementPopover shippingRequirement={shippingRequirement} />
    )
  ].filter((r) => !!r)

  const joinIndex = list.length - 1
  const joiner = list.length === 2 ? <Text> and </Text> : <Text>, </Text>
  const hasJoin = list.length > 1
  const riList = list.map((component, key) => ({ component, key }))

  if (list.length === 0)
    return (
      <Text italic color="black-tint-40">
        There are no request requirements for this resource.
      </Text>
    )

  return (
    <Text>
      {riList.map((requirement, i) => (
        <Text key={requirement.key}>
          {requirement.component}
          {hasJoin && i < joinIndex && joiner}{' '}
        </Text>
      ))}
    </Text>
  )
}
