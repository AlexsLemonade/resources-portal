import fetch from 'isomorphic-unfetch'
import FormData from 'form-data'

export const host = process.env.API_HOST
export const version = process.env.API_VERSION
export const path = `${host}/${version}/`

// create new form data object and attach keys from object
const formDataFromKeys = (obj, ...keys) => {
  const formData = new FormData()
  keys.forEach((key) => {
    if (Object.keys(obj).includes(key)) {
      formData.append(key, obj[key])
    }
  })
  return formData
}

const urlSearchParamsFromKeys = (query, ...keys) => {
  const search = new URLSearchParams()

  const appendParam = (key, val) => {
    if (keys.length === 0 || keys.includes(key)) {
      if (Array.isArray(val)) {
        val.forEach((v) => appendParam(key, v))
      } else {
        search.append(key, val)
      }
    }
  }

  Object.entries(query).forEach((entry) => appendParam(...entry))

  return search
}

const getAPIURL = (endpoint = '', query = {}) => {
  const url = new URL(endpoint, path)
  const search = urlSearchParamsFromKeys(query)
  url.search = search

  return url.href || url
}

const parseFetchResponse = async (response) => {
  try {
    return await response.json()
  } catch (e) {
    return {}
  }
}

const request = async (
  url,
  { headers = {}, authorization, ...options } = {}
) => {
  const config = { headers, ...options }

  // add authorization token to headers
  if (authorization) {
    config.headers.Authorization = `Token ${authorization}`
  }

  // default to json when not formdata
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(url, config)
    return {
      isOk: response.ok,
      status: response.status,
      response: await parseFetchResponse(response)
    }
  } catch (e) {
    return {
      isOk: false,
      status: e.status,
      error: e
    }
  }
}

export const userLogin = (data) =>
  request(getAPIURL('login/'), {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const userCreate = (data) =>
  request(getAPIURL('users/'), {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const userGetInfo = (userId, authorization) =>
  request(getAPIURL(`users/${userId}/`), { authorization })

export const userGetORCID = (authCode, originUrl) =>
  request(getAPIURL('orcid-credentials/'), {
    method: 'POST',
    body: JSON.stringify({ code: authCode, origin_url: originUrl })
  })

export default {
  search: {
    resources: (query) => request(getAPIURL('search/materials/', query)),
    users: (query, authorization) =>
      request(getAPIURL('search/users/', query), { authorization })
  },
  resources: {
    get: (id) => request(getAPIURL(`materials/${id}/`)),
    create: (resource, authorization) =>
      request(getAPIURL('materials/'), {
        authorization,
        method: 'POST',
        body: JSON.stringify(resource)
      }),
    update: (resourceId, resource, authorization) =>
      request(getAPIURL(`materials/${resourceId}/`), {
        authorization,
        method: 'PUT',
        body: JSON.stringify(resource)
      }),
    filter: (query) => request(getAPIURL('materials/', query)),
    import: (resource, authorization) =>
      request(getAPIURL('materials/import/'), {
        authorization,
        method: 'POST',
        body: JSON.stringify(resource)
      }),
    requests: {
      filter: (id, query = {}, authorization) =>
        request(getAPIURL(`materials/${id}/requests`, query), {
          authorization,
          method: 'GET'
        })
    },
    delete: (id, authorization) =>
      request(getAPIURL(`materials/${id}/`), {
        authorization,
        method: 'DELETE'
      })
  },
  user: {
    get: userGetInfo,
    refreshToken: (token) =>
      request(getAPIURL('refresh-token/'), {
        method: 'POST',
        body: { token }
      }),
    login: async (orcid, accessToken, refreshToken) => {
      const loginRequest = await userLogin({
        orcid,
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (!loginRequest.isOk) {
        return [loginRequest]
      }

      const userRequest = await userGetInfo(
        loginRequest.response.user_id,
        loginRequest.response.token
      )

      return [loginRequest, userRequest]
    },
    create: async (orcid, accessToken, refreshToken, email, grants) => {
      const createUserRequest = await userCreate({
        email,
        grants,
        orcid,
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (!createUserRequest.isOk) {
        return [createUserRequest]
      }

      const userRequest = await userGetInfo(
        createUserRequest.response.user_id,
        createUserRequest.response.token
      )

      return [createUserRequest, userRequest]
    },
    getORCID: userGetORCID,
    teams: {
      list: (userId, authorization) =>
        request(getAPIURL(`users/${userId}/organizations/`), { authorization })
    },
    update: (userId, updates, authorization) =>
      request(getAPIURL(`users/${userId}/`), {
        authorization,
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    addresses: {
      get: (userId, addressId, authorization) =>
        request(getAPIURL(`users/${userId}/addresses/${addressId}/`), {
          authorization
        }),
      create: (userId, address, authorization) =>
        request(getAPIURL(`users/${userId}/addresses/`), {
          authorization,
          method: 'POST',
          body: JSON.stringify(address)
        }),
      update: (userId, addressId, changes, authorization) =>
        request(getAPIURL(`users/${userId}/addresses/${addressId}/`), {
          authorization,
          method: 'PATCH',
          body: JSON.stringify(changes)
        })
    },
    notifications: {
      list: (userId, authorization) =>
        request(getAPIURL(`users/${userId}/notifications/`), {
          authorization
        })
    }
  },
  teams: {
    get: (organizationId, authorization) =>
      request(getAPIURL(`organizations/${organizationId}/`), {
        authorization
      }),
    create: (organization, authorization) =>
      request(getAPIURL('organizations/'), {
        authorization,
        method: 'POST',
        body: JSON.stringify(organization)
      }),
    update: (organizationId, organization, authorization) =>
      request(getAPIURL(`organizations/${organizationId}/`), {
        authorization,
        method: 'PATCH',
        body: JSON.stringify(organization)
      }),
    grants: {
      get: (organizationId, authorization) =>
        request(getAPIURL(`organizations/${organizationId}/grants/`), {
          authorization
        }),
      add: (organizationId, grantId, authorization) =>
        request(getAPIURL(`organizations/${organizationId}/grants/`), {
          authorization,
          method: 'POST',
          body: JSON.stringify({ id: grantId })
        }),
      remove: (organizationId, grantId, authorization) =>
        request(
          getAPIURL(`organizations/${organizationId}/grants/${grantId}/`),
          {
            authorization,
            method: 'DELETE'
          }
        )
    },
    members: {
      invite: (invitation, authorization) =>
        request(getAPIURL('invitations/'), {
          authorization,
          method: 'POST',
          body: JSON.stringify(invitation)
        }),
      remove: (organizationId, memberId, authorization) =>
        request(
          getAPIURL(`organizations/${organizationId}/members/${memberId}`),
          {
            authorization,
            method: 'DELETE'
          }
        )
    },
    resources: {
      get: (organizationId, authorization) =>
        request(getAPIURL(`organizations/${organizationId}/materials/`), {
          authorization
        })
    }
  },
  attachments: {
    create: async (attachment, authorization) => {
      const formData = formDataFromKeys(
        attachment,
        'file',
        'description',
        'owned_by_org'
      )
      return request(getAPIURL('attachments/'), {
        authorization,
        method: 'POST',
        body: formData
      })
    },
    update: (id, attachment, authorization) => {
      // take the attachment object and only PUT the changable things
      const updates = urlSearchParamsFromKeys(
        attachment,
        'description',
        'sequence_map_for'
      )
      return request(getAPIURL(`attachments/${id}/`), {
        authorization,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'PATCH',
        body: updates
      })
    },
    delete: (id, authorization) =>
      request(getAPIURL(`attachments/${id}/`), {
        authorization,
        method: 'DELETE'
      }),
    copy: (id, authorization) =>
      request(getAPIURL(`attachments/${id}/copy/`), {
        authorization,
        method: 'POST'
      })
  },
  shippingRequirements: {
    create: (shippingRequirement, authorization) =>
      request(getAPIURL('shipping-requirements/'), {
        authorization,
        method: 'POST',
        body: JSON.stringify(shippingRequirement)
      }),
    update: (requirementId, updates, authorization) =>
      request(getAPIURL(`shipping-requirements/${requirementId}/`), {
        authorization,
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
  },
  grants: {
    get: () => {},
    material: {
      create: (grantId, materialId, authorization) =>
        request(getAPIURL(`grants/${grantId}/materials/`), {
          authorization,
          method: 'POST',
          body: JSON.stringify({
            id: materialId
          })
        }),
      delete: (grantId, materialId, authorization) =>
        request(getAPIURL(`grants/${grantId}/materials/`), {
          authorization,
          method: 'DELETE',
          body: JSON.stringify({
            id: materialId
          })
        })
    }
  },
  issue: {
    create: (issue, authorization) =>
      request(getAPIURL('report-issue/'), {
        authorization,
        method: 'POST',
        body: JSON.stringify(issue)
      })
  },
  invite: (email, authorization) =>
    request(getAPIURL('email-invitation/'), {
      authorization,
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  requests: {
    get: (materialRequestId, authorization) =>
      request(getAPIURL(`material-requests/${materialRequestId}/`), {
        authorization
      }),
    create: (materialRequest, authorization) =>
      request(getAPIURL('material-requests/'), {
        authorization,
        method: 'POST',
        body: JSON.stringify(materialRequest)
      }),
    update: (materialRequestId, changes, authorization) =>
      request(getAPIURL(`material-requests/${materialRequestId}/`), {
        authorization,
        method: 'PATCH',
        body: JSON.stringify(changes)
      }),
    list: (authorization) =>
      request(getAPIURL('material-requests/'), {
        authorization
      }),
    filter: (filter, authorization) =>
      request(getAPIURL('material-requests/', filter), {
        authorization
      }),
    notes: {
      add: (materialRequestId, text, authorization) =>
        request(
          getAPIURL(
            `material-requests/${materialRequestId}/fulfillment-notes/`
          ),
          {
            authorization,
            method: 'POST',
            body: JSON.stringify({ text, material_request: materialRequestId })
          }
        )
    },
    issues: {
      add: (materialRequestId, description, authorization) =>
        request(getAPIURL(`material-requests/${materialRequestId}/issues/`), {
          authorization,
          method: 'POST',
          body: JSON.stringify({
            description,
            material_request: materialRequestId
          })
        })
    }
  }
}
