// helper for getting a flatter way to check the request requirements

export default (material) => {
  const {
    mta_attachment: mtaAttachment,
    needs_mta: needsMta,
    needs_irb: needsIrb,
    needs_abstract: needsAbstract
  } = material

  const hasShippingRequirement = Boolean(material.shipping_requirement)

  const {
    accepts_other_payment_methods: acceptsOtherPaymentMethods,
    accepts_reimbursement: acceptsReimbursement,
    accepts_shipping_code: acceptsShippingCode,
    needs_payment: needsPayment,
    needs_shipping_address: needsShippingAddress,
    restrictions,
    sharer_pays_shipping: sharerPaysShipping
  } = material.shipping_requirement || {}

  // checks for mtaAttachment for accuracy before resource is saved
  const hasRequirements =
    !!mtaAttachment ||
    needsMta ||
    needsIrb ||
    needsAbstract ||
    hasShippingRequirement

  return {
    hasRequirements,
    mtaAttachment,
    needsMta,
    needsIrb,
    needsAbstract,
    hasShippingRequirement,
    shippingRequirement: {
      acceptsOtherPaymentMethods,
      acceptsReimbursement,
      acceptsShippingCode,
      needsPayment,
      needsShippingAddress,
      sharerPaysShipping,
      restrictions
    }
  }
}
