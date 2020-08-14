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

  console.log('options: ', config)

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

export const loginUser = () => {}
// return array of api responses

export const userAuthenticate = (query) => request(getAPIURL('auth/', query))

export const userGetInfo = (userId, authorization) =>
  request(`${getAPIURL(`users/${userId}`)}`, { authorization })

export default {
  search: {
    resources: (query) => request(getAPIURL('search/materials', query))
  },
  resources: {
    find: (id) => request(getAPIURL(`materials/${id}`))
  },
  user: {
    authenticate: userAuthenticate,
    getInfo: userGetInfo,
    refreshToken: (token) =>
      request(`${getAPIURL('refresh-token/')}`, {
        method: 'POST',
        body: { token }
      }),
    login: async (authCode, originUrl, loginAttributes) => {
      const tokenRequest = await userAuthenticate({
        ...loginAttributes,
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
  }
}
