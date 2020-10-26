import { useLocalStorage } from 'hooks/useLocalStorage'
import { useRouter } from 'next/router'
import React from 'react'
import api from '../api'
import { useUser } from './useUser'

export const useSignIn = () => {
  const { user, setUser, setToken } = useUser()
  const [error, setError] = React.useState('')
  const [email, setEmail] = useLocalStorage('email')
  const [needsEmail, setNeedsEmail] = useLocalStorage('needsEmail', false)
  const [orcidInfo, setOrcidInfo] = useLocalStorage('orcidInfo')
  const [clientRedirectUrl] = useLocalStorage('clientRedirectUrl', '')
  const router = useRouter()

  const loginOrCreateUser = async () => {
    const [tokenRequest, userRequest] = await api.user.login(
      orcidInfo.orcid,
      orcidInfo.accessToken,
      orcidInfo.refreshToken
    )

    const userInfo = {}

    if (tokenRequest.isOk) {
      userInfo.token = tokenRequest.response.token

      if (userRequest.isOk) {
        userInfo.authenticatedUser = userRequest.response
      }
    } else {
      const [creationTokenRequest, creationUserRequest] = await api.user.create(
        orcidInfo.orcid,
        orcidInfo.accessToken,
        orcidInfo.refreshToken,
        email
      )

      if (creationTokenRequest.status === 401) {
        setError(creationTokenRequest)
        setNeedsEmail(true)
        return
      }

      if (!creationTokenRequest.isOk) {
        setError(creationTokenRequest)
        return
      }

      userInfo.token = creationTokenRequest.response.token

      if (!creationUserRequest.status === 200) {
        setError(creationUserRequest)
        return
      }

      userInfo.authenticatedUser = creationUserRequest.response
    }

    if (userInfo.authenticatedUser && userInfo.authenticatedUser.id) {
      setUser(userInfo.authenticatedUser)
    }
    if (userInfo.token) {
      setToken(userInfo.token)
    }
  }

  const cleanup = () => {
    window.localStorage.removeItem('email')
    window.localStorage.removeItem('needsEmail')
    window.localStorage.removeItem('orcidInfo')
    window.localStorage.removeItem('clientRedirectUrl')
  }

  React.useEffect(() => {
    if (orcidInfo && !user && !error && !needsEmail) {
      loginOrCreateUser()
    }
  })

  React.useEffect(() => {
    router.events.on('routeChangeStart', cleanup)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', cleanup)
    }
  })

  if (clientRedirectUrl && user && !needsEmail) {
    router.replace(clientRedirectUrl)
  }

  return {
    loginOrCreateUser,
    needsEmail,
    setNeedsEmail,
    cleanup,
    setError,
    setEmail,
    setOrcidInfo,
    orcidInfo,
    user
  }
}
