import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  get: (materialRequestId, authorization) =>
    request(getAPIUrl(`material-requests/${materialRequestId}/`), {
      authorization
    }),
  create: (materialRequest, authorization) =>
    request(getAPIUrl('material-requests/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify(materialRequest)
    }),
  update: (materialRequestId, changes, authorization) =>
    request(getAPIUrl(`material-requests/${materialRequestId}/`), {
      authorization,
      method: 'PATCH',
      body: JSON.stringify(changes)
    }),
  list: (authorization) =>
    request(getAPIUrl('material-requests/'), {
      authorization
    }),
  filter: (filter, authorization) =>
    request(getAPIUrl('material-requests/', filter), {
      authorization
    }),
  notes: {
    add: (materialRequestId, text, authorization) =>
      request(
        getAPIUrl(`material-requests/${materialRequestId}/fulfillment-notes/`),
        {
          authorization,
          method: 'POST',
          body: JSON.stringify({ text, material_request: materialRequestId })
        }
      )
  },
  issues: {
    add: (materialRequestId, description, authorization) =>
      request(getAPIUrl(`material-requests/${materialRequestId}/issues/`), {
        authorization,
        method: 'POST',
        body: JSON.stringify({
          description,
          material_request: materialRequestId
        })
      })
  }
}
