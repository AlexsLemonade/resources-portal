export const allStatuses = [
  'OPEN',
  'AWAITING_ADDITIONAL_DOCUMENTS',
  'AWAITING_MTA',
  'IN_FULFILLMENT',
  'IN_FULFILLMENT_ISSUE_REPORTED',
  'FULFILLED',
  'VERIFIED_FULFILLED',
  'CLOSED',
  'REJECTED',
  'INVALID',
  'CANCELLED'
]

export const getRequestProgressStatuses = (request) => {
  const states = ['OPEN']
  const willWaitIRB = request.material.needs_irb
  const willWaitMTA = request.material.needs_mta
  const willWaitShipping = request.shipping_requirements

  if (willWaitIRB || willWaitMTA || willWaitShipping) {
    states.push('AWAITING_ADDITIONAL_DOCUMENTS')
  }

  if (willWaitMTA) {
    states.push('AWAITING_MTA')
  }

  states.push('IN_FULFILLMENT')
  states.push('FULFILLED')

  return states
}

export default (request) => {
  if (request.status === 'APPROVED') {
    if (request.requires_action_requester)
      return 'AWAITING_ADDITIONAL_DOCUMENTS'
    if (request.requires_action_sharer) return 'AWAITING_MTA'
    // we should send this error to sentry
    // because this should never occur
  }

  if (request.status === 'IN_FULFILLMENT') {
    if (request.has_issues) {
      return 'IN_FULFULLMENT_ISSUE_REPORTED'
    }
  }

  return request.status
}
