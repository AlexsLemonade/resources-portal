import api from 'api'
import { Loader } from 'components/Loader'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { useLocalStorage } from 'hooks/useLocalStorage'
import { useUser } from 'hooks/useUser'
import { useRouter } from 'next/router'
import React from 'react'

export const Account = ({
  authenticatedUser,
  token,
  error,
  noCode,
  needsEmail
}) => {
  const router = useRouter()
  const { addAlert } = useAlertsQueue()
  const [errorHasFired, setErrorHasFired] = React.useState(false)

  // If the user navigates to /account manually, redirect them to /account/basic-information
  if (noCode) {
    router.replace('/account/basic-information')
  }

  console.log(error)

  React.useEffect(() => {
    // If there is a problem creating the user, redirect to home.
    if (needsEmail && !errorHasFired) {
      addAlert(
        'There was no email found on your ORCID account. Please set your email preferences to "Trusted Parties" on ORCID to proceed.',
        'error'
      )
      setErrorHasFired(true)
      router.replace('/')
    } else if (error && !errorHasFired) {
      addAlert('Your account was not found and could not be created.', 'error')
      setErrorHasFired(true)
      router.replace('/')
    }
  })

  useUser(authenticatedUser, token)

  const [clientRedirectUrl, setClientRedirectUrl] = useLocalStorage(
    'clientRedirectUrl',
    ''
  )

  if (clientRedirectUrl) {
    router.replace(clientRedirectUrl)
    setClientRedirectUrl()
  }

  return <Loader />
}

Account.getInitialProps = async ({ req, query }) => {
  // Revisit how to present errors thrown from this function
  if (!query.code) {
    return { noCode: true }
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

    if (creationTokenRequest.status === 401) {
      return { error: creationTokenRequest, needsEmail: true }
    }

    if (!creationTokenRequest.isOk) {
      return { error: creationTokenRequest }
    }

    initialProps.token = creationTokenRequest.response.token

    if (!creationUserRequest.status === 200) {
      return { error: creationUserRequest }
    }

    initialProps.authenticatedUser = creationUserRequest.response
  }

  return initialProps
}

export default Account
