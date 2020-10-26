import getAPIUrl from 'helpers/getAPIUrl'
import request from 'helpers/request'

export default {
  get: (userId, authorization) =>
    request(getAPIUrl(`users/${userId}/`), { authorization }),
  refreshToken: (token) =>
    request(getAPIUrl('refresh-token/'), {
      method: 'POST',
      body: { token }
    }),
  authenticate: (orcidCredentials) =>
    request(getAPIUrl('login/'), {
      method: 'POST',
      body: JSON.stringify(orcidCredentials)
    }),
  create: (user) =>
    request(getAPIUrl('users/'), {
      method: 'POST',
      body: JSON.stringify(user)
    }),
  teams: {
    list: (userId, authorization) =>
      request(getAPIUrl(`users/${userId}/organizations/`), { authorization })
  },
  update: (userId, updates, authorization) =>
    request(getAPIUrl(`users/${userId}/`), {
      authorization,
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  addresses: {
    get: (userId, addressId, authorization) =>
      request(getAPIUrl(`users/${userId}/addresses/${addressId}/`), {
        authorization
      }),
    create: (userId, address, authorization) =>
      request(getAPIUrl(`users/${userId}/addresses/`), {
        authorization,
        method: 'POST',
        body: JSON.stringify(address)
      }),
    update: (userId, addressId, changes, authorization) =>
      request(getAPIUrl(`users/${userId}/addresses/${addressId}/`), {
        authorization,
        method: 'PATCH',
        body: JSON.stringify(changes)
      })
  },
  notifications: {
    list: (userId, authorization) =>
      request(getAPIUrl(`users/${userId}/notifications/`), {
        authorization
      }),
    filter: (userId, filter, authorization) =>
      request(getAPIUrl(`users/${userId}/notifications/`, filter), {
        authorization
      })
  }
}
