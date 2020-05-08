export const host = process.env.API_HOST
export const version = process.env.API_VERSION
export const path = host && version ? `${host}/${version}/` : false

const getURL = (endpoint = '', query = {}) => {
  const search = new URLSearchParams()

  const appendParam = (key, val) =>
    Array.isArray(val)
      ? val.forEach((v) => appendParam(key, v))
      : search.append(key, val)

  Object.entries(query).forEach((entry) => appendParam(...entry))

  const url = new URL(endpoint, path)
  url.search = search

  return url
}

const request = async (endpoint, query, headers, method = 'GET') => {
  try {
    const apiResponse = await fetch(getURL(endpoint, query), {
      method,
      headers: {
        'content-type': 'application/json',
        ...headers
      }
    })
    const response = await apiResponse.json()
    return {
      isOk: true,
      status: response.status,
      response
    }
  } catch (e) {
    return {
      isOk: false,
      status: e.status,
      error: e
    }
  }
}

export default {
  search: {
    resources: (query) => request('search/materials', query, {}, 'GET')
  },
  resources: {
    find: (id) => request(`materials/${id}`, {}, {}, 'GET')
  }
}
