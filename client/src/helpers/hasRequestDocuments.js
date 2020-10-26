// check if a material will have documents to show after request

export default (material) => {
  if (material.needs_irb) return true
  if (material.needs_mta) return true
  if (material.needs_abstract) return true
  if (material.shipping_requirement) {
    if (material.shipping_requirement.needs_payment) return true
    if (material.shipping_requirement.needs_shipping_address) return true
    return true
  }
  return false
}
