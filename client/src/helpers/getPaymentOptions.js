import { getReadable } from 'helpers/readableNames'

export default (request) => {
  const paymentOptions = []
  if (request.material.shipping_requirement) {
    const {
      accepts_shipping_code: shippingCode,
      accepts_reimbursement: reimbursement,
      accepts_other_payment_methods: other
    } = request.material.shipping_requirement
    if (shippingCode) paymentOptions.push('SHIPPING_CODE')
    if (reimbursement) paymentOptions.push('REIMBURSEMENT')
    if (other) paymentOptions.push('OTHER_PAYMENT_METHOD')
  }
  return paymentOptions.map((value) => ({ value, label: getReadable(value) }))
}
