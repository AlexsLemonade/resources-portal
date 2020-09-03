import api from 'api'
import { Loader } from 'components/Loader'
import { useLocalStorage } from 'hooks/useLocalStorage'
import { useUser } from 'hooks/useUser'
import { useRouter } from 'next/router'
import React from 'react'

export const Account = ({ authenticatedUser, token }) => {
  console.log(authenticatedUser, token)
  useUser(authenticatedUser, token)
  const router = useRouter()

  // if (!authenticatedUser) {
  //   router.replace('/')
  // }
  const [clientRedirectUrl, setClientRedirectUrl] = useLocalStorage(
    'clientRedirectUrl',
    ''
  )

  // if (clientRedirectUrl) {
  //   router.replace(clientRedirectUrl)
  //   setClientRedirectUrl()
  // }

  return <Loader />
}

Account.getInitialProps = async ({ req, query }) => {
  // Revisit how to present errors thrown from this function
  if (!query.code) {
    return { authenticatedUser: '123' }
  }

  const response = await api.user.getORCID(
    query.code,
    decodeURI(`http://${req.headers.host}${req.url}`)
  )

  const [tokenRequest, userRequest] = await api.user.login(
    response.response.orcid,
    response.response.access_token,
    response.response.refresh_token
  )

  const initialProps = {}

  if (tokenRequest.isOk) {
    initialProps.token = tokenRequest.response.token

    if (userRequest.isOk) {
      initialProps.authenticatedUser = userRequest.response
    }
  } else {
    const [creationTokenRequest, creationUserRequest] = await api.user.create(
      response.response.orcid,
      response.response.access_token,
      response.response.refresh_token
    )

    if (!creationTokenRequest.isOk) {
      console.log('error', tokenRequest)
      return { authenticatedUser: tokenRequest }
    }

    if (creationTokenRequest.status === 401) {
      initialProps.needsEmail = true
      return { authenticatedUser: '2' }
    }

    initialProps.token = creationTokenRequest.response.token

    if (!creationUserRequest.status === 200) {
      console.log('error', creationUserRequest)
      return { authenticatedUser: '3' }
    }

    initialProps.authenticatedUser = creationUserRequest.response
  }

  return initialProps
}

export default Account
