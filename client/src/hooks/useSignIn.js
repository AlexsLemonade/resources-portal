import { useLocalStorage } from 'hooks/useLocalStorage'
import { useRouter } from 'next/router'
import React from 'react'
import api from 'api'
import { useUser } from 'hooks/useUser'

export const useSignIn = (code, originUrl) => {
  const { user, fetchUserWithNewToken } = useUser()
  const [error, setError] = React.useState('')
  const [email, setEmail] = useLocalStorage('email')
  const [needsEmail, setNeedsEmail] = useLocalStorage('needsEmail', false)
  const [orcidInfo, setOrcidInfo] = useLocalStorage('orcidInfo')
  const [clientRedirectUrl] = useLocalStorage('clientRedirectUrl', '')
  const router = useRouter()

  const cleanup = () => {
    window.localStorage.removeItem('email')
    window.localStorage.removeItem('needsEmail')
    window.localStorage.removeItem('orcidInfo')
    window.localStorage.removeItem('clientRedirectUrl')
  }

  const loginOrCreateUser = async () => {
    const orcidRequest = await api.orcid.create(code, originUrl)

    if (!orcidRequest.isOk) {
      setError(orcidRequest)
      return
    }

    const tokenRequest = await api.users.authenticate(orcidRequest.response)

    if (tokenRequest.isOk) {
      fetchUserWithNewToken(
        tokenRequest.response.user_id,
        tokenRequest.response.token
      )
    }

    // the user was not able to be authenticated
    // create them
    if (!tokenRequest.isOk) {
      const createUserRequest = await api.users.create(
        orcidRequest.response,
        email
      )

      if (createUserRequest.status === 401) {
        setError(createUserRequest)
        setNeedsEmail(true)
        return
      }

      if (!createUserRequest.isOk) {
        setError(createUserRequest)
        return
      }

      if (!createUserRequest.status === 200) {
        setError(createUserRequest)
      }

      const {
        response: { user_id: userId, token: newToken }
      } = createUserRequest

      fetchUserWithNewToken(userId, newToken)
    }
  }

  React.useEffect(() => {
    // clean up local storage on navigation
    router.events.on('routeChangeStart', cleanup)

    const canLoginOrCreateUser = code && !user && !error && !needsEmail
    if (canLoginOrCreateUser) loginOrCreateUser()

    const canRedirectUser = user && !needsEmail
    if (canRedirectUser)
      router.replace(clientRedirectUrl || '/account/basic-information')

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', cleanup)
    }
  })

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
