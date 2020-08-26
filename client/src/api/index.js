import fetch from 'isomorphic-unfetch'

export const host = process.env.API_HOST
export const version = process.env.API_VERSION
export const path = `${host}/${version}/`

// create new form data object and attack keys from object
const formDataFromKeys = (obj, ...keys) => {
  const formData = new FormData()
  keys.forEach((key) => formData.append(key, obj[key]))
  return formData
}

const getAPIURL = (endpoint = '', query = {}) => {
  const search = new URLSearchParams()

  const appendParam = (key, val) =>
    Array.isArray(val)
      ? val.forEach((v) => appendParam(key, v))
      : search.append(key, val)

  Object.entries(query).forEach((entry) => appendParam(...entry))

  const url = new URL(endpoint, path)
  url.search = search

  return url.href || url
}

const request = async (
  url,
  { headers = {}, authorization, ...options } = {}
) => {
  const Authorization = authorization ? `Token ${authorization}` : undefined
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization,
      ...headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    return {
      isOk: response.ok,
      status: response.status,
      response: await response.json()
    }
  } catch (e) {
    return {
      isOk: false,
      status: e.status,
      error: e
    }
  }
}

const formDataRequest = async (
  url,
  { headers = {}, authorization, ...options } = {}
) => {
  const Authorization = authorization ? `Token ${authorization}` : undefined
  const config = {
    headers: {
      Authorization,
      ...headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    return {
      isOk: response.ok,
      status: response.status,
      response: await response.json()
    }
  } catch (e) {
    return {
      isOk: false,
      status: e.status,
      error: e
    }
  }
}

export const loginUser = () => {}

export const userAuthenticate = (data) =>
  request(getAPIURL('auth/'), {
    method: 'POST',
    body: JSON.stringify(data)
  })

export const userGetInfo = (userId, authorization) =>
  request(`${getAPIURL(`users/${userId}`)}`, { authorization })

export default {
  search: {
    resources: (query) => request(getAPIURL('search/materials', query))
  },
  resources: {
    detail: (id) => request(getAPIURL(`materials/${id}`))
  },
  user: {
    authenticate: userAuthenticate,
    getInfo: userGetInfo,
    refreshToken: (token) =>
      request(getAPIURL('refresh-token/'), {
        method: 'POST',
        body: { token }
      }),
    login: async (authCode, originUrl) => {
      const tokenRequest = await userAuthenticate({
        origin_url: originUrl,
        code: authCode
      })

      if (!tokenRequest.isOk) {
        return [tokenRequest]
      }

      const userRequest = await userGetInfo(
        tokenRequest.response.user_id,
        tokenRequest.response.token
      )

      return [tokenRequest, userRequest]
    },
    create: async (authCode, originUrl, email, grants) => {
      const tokenRequest = await userAuthenticate({
        email,
        grants,
        origin_url: originUrl,
        code: authCode
      })

      if (!tokenRequest.isOk) {
        return [tokenRequest]
      }

      const userRequest = await userGetInfo(
        tokenRequest.response.user_id,
        tokenRequest.response.token
      )

      return [tokenRequest, userRequest]
    }
  },
  teams: {
    get: (organizationId, authorization) =>
      request(getAPIURL(`organizations/${organizationId}/`), {
        authorization
      }),
    grants: {
      get: (organizationId, authorization) =>
        request(getAPIURL(`organizations/${organizationId}/grants/`), {
          authorization
        })
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
      const formData = formDataFromKeys(attachment, 'file', 'description')
      return formDataRequest(getAPIURL('attachments/'), {
        authorization,
        method: 'POST',
        body: formData
      })
    },
    update: (id, attachment, authorization) => {
      // take the attachment object and only PUT the changable things
      const formData = formDataFromKeys(attachment, 'description')
      return request(getAPIURL(`attachments/${id}/`), {
        authorization,
        method: 'PATCH',
        body: formData
      })
    },
    delete: (id, authorization) => {
      return request(getAPIURL(`attachments/${id}/`), {
        authorization,
        method: 'DELETE'
      })
    }
  }
}
