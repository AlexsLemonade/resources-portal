import fetch from 'isomorphic-unfetch'

export const host = process.env.API_HOST
export const version = process.env.API_VERSION
export const path = `${host}/${version}/`

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
  const { body } = options
  const config = { ...options }
  config.body = body
  config.headers = {
    'content-type': 'application/json',
    ...headers
  }
  if (authorization) config.headers.Authorization = `Token ${authorization}`

  try {
    const response = await fetch(url, config)
    return {
      isOk: true,
      status: response.status,
      response: await response.json()
    }
  } catch (e) {
    console.log(e)
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
  request(getAPIURL('create-user/'), {
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

export default {
  search: {
    resources: (query) => request(getAPIURL('search/materials', query))
  },
  resources: {
    find: (id) => request(getAPIURL(`materials/${id}`))
  },
  user: {
    getInfo: userGetInfo,
    refreshToken: (token) =>
      request(`${getAPIURL('refresh-token/')}`, {
        method: 'POST',
        body: { token }
      }),
    login: async (authCode, originUrl) => {
      const tokenRequest = await userLogin({
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
    create: async (orcid, accessToken, refreshToken, email, grants) => {
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
  }
}
