import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  create: (shippingRequirement, authorization) =>
    request(getAPIUrl('shipping-requirements/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify(shippingRequirement)
    }),
  update: (shippingRequirementId, updates, authorization) =>
    request(getAPIUrl(`shipping-requirements/${shippingRequirementId}/`), {
      authorization,
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
}
