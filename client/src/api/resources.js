import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  get: (id) => request(getAPIUrl(`materials/${id}/`)),
  create: (resource, authorization) =>
    request(getAPIUrl('materials/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify(resource)
    }),
  update: (resourceId, resource, authorization) =>
    request(getAPIUrl(`materials/${resourceId}/`), {
      authorization,
      method: 'PATCH',
      body: JSON.stringify(resource)
    }),
  filter: (query) => request(getAPIUrl('materials/', query)),
  import: (resource, authorization) =>
    request(getAPIUrl('materials/import/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify(resource)
    }),
  requests: {
    filter: (id, query = {}, authorization) =>
      request(getAPIUrl(`materials/${id}/requests`, query), {
        authorization,
        method: 'GET'
      })
  },
  delete: (id, authorization) =>
    request(getAPIUrl(`materials/${id}/`), {
      authorization,
      method: 'DELETE'
    })
}
