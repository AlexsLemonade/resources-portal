import fetch from 'isomorphic-unfetch'

export const host = process.env.API_HOST
export const version = process.env.API_VERSION
export const path = `${host}/${version}/`

// create new form data object and attach keys from object
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
  request(`${getAPIURL(`users/${userId}`)}`, { authorization })

export const userGetORCID = (authCode, originUrl) => {
  const credentialResponse = request(`${getAPIURL('orcid-credentials/')}`, {
    method: 'POST',
    body: JSON.stringify({ code: authCode, origin_url: originUrl })
  })
  return credentialResponse
}

export const createIssue = async (requestBody, authorization) => {
  const credentialResponse = request(`${getAPIURL('report-issue/')}`, {
    authorization,
    method: 'POST',
    body: JSON.stringify(requestBody)
  })
  return credentialResponse
}

export default {
  search: {
    resources: (query) => request(getAPIURL('search/materials', query))
  },
  resources: {
    detail: (id) => request(getAPIURL(`materials/${id}`))
  },
  user: {
    getInfo: userGetInfo,
    refreshToken: (token) =>
      request(getAPIURL('refresh-token/'), {
        method: 'POST',
        body: { token }
      }),
    login: async (orcid, accessToken, refreshToken) => {
      const tokenRequest = await userLogin({
        orcid,
        access_token: accessToken,
        refresh_token: refreshToken
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
    create: async (orcid, accessToken, refreshToken, email, grants) => {
      console.print(
        JSON.stringify({
          email,
          grants,
          orcid,
          access_token: accessToken,
          refresh_token: refreshToken
        })
      )
      const tokenRequest = await userCreate({
        email,
        grants,
        orcid,
        access_token: accessToken,
        refresh_token: refreshToken
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
    getORCID: userGetORCID
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
  },
  issue: {
    create: createIssue
  }
}
