import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  get: (organizationId, authorization) =>
    request(getAPIUrl(`organizations/${organizationId}/`), {
      authorization
    }),
  create: (organization, authorization) =>
    request(getAPIUrl('organizations/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify(organization)
    }),
  update: (organizationId, organization, authorization) =>
    request(getAPIUrl(`organizations/${organizationId}/`), {
      authorization,
      method: 'PATCH',
      body: JSON.stringify(organization)
    }),
  grants: {
    get: (organizationId, authorization) =>
      request(getAPIUrl(`organizations/${organizationId}/grants/`), {
        authorization
      }),
    add: (organizationId, grantId, authorization) =>
      request(getAPIUrl(`organizations/${organizationId}/grants/`), {
        authorization,
        method: 'POST',
        body: JSON.stringify({ id: grantId })
      }),
    remove: (organizationId, grantId, query = {}, authorization) =>
      request(
        getAPIUrl(`organizations/${organizationId}/grants/${grantId}/`, query),
        {
          authorization,
          method: 'DELETE'
        }
      )
  },
  members: {
    invite: (invitation, authorization) =>
      request(getAPIUrl('invitations/'), {
        authorization,
        method: 'POST',
        body: JSON.stringify(invitation)
      }),
    remove: (organizationId, memberId, authorization) =>
      request(
        getAPIUrl(`organizations/${organizationId}/members/${memberId}`),
        {
          authorization,
          method: 'DELETE'
        }
      )
  },
  resources: {
    get: (organizationId, authorization) =>
      request(getAPIUrl(`organizations/${organizationId}/materials/`), {
        authorization
      })
  }
}
