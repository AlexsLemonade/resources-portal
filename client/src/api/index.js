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

const request = async (url, { headers = {}, ...options } = {}) => {
  const config = { ...options }
  config.headers = {
    'content-type': 'application/json',
    ...headers
  }

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

export default {
  search: {
    resources: (query) => request(getAPIURL('search/materials', query))
  },
  resources: {
    find: (id) => request(getAPIURL(`materials/${id}`))
  },
  authenticate: (code, email, originUrl) =>
    request(
      `${getAPIURL(
        `auth/`
      )}?code=${code}&email=${email}&origin_url=${originUrl}`
    )
}
