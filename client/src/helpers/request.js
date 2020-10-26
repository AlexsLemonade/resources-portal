import fetch from 'isomorphic-unfetch'
import FormData from 'form-data'

const parseRequestResponse = async (response) => {
  try {
    return await response.json()
  } catch (e) {
    return {}
  }
}

// browser/server safe request api with standard pre-parsed responses
export default async (
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
      response: await parseRequestResponse(response)
    }
  } catch (e) {
    return {
      isOk: false,
      status: e.status,
      error: e
    }
  }
}
