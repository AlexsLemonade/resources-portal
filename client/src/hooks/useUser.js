import { useRouter } from 'next/router'
import React from 'react'
import api from '../api'
import { ResourcesPortalContext } from '../ResourcesPortalContext'
import { useLocalStorage } from './useLocalStorage'

export const useUser = (defaultUser, defaultToken, redirectUrl) => {
  const [loginRedirectUrl, setLoginRedirectUrl] = useLocalStorage(
    'redirectUrl',
    redirectUrl
  )
  const { user, setUser, token, setToken } = React.useContext(
    ResourcesPortalContext
  )
  const router = useRouter()
  React.useEffect(() => {
    if (defaultUser && defaultToken) {
      setUser(defaultUser)
      setToken(defaultToken)
      if (loginRedirectUrl) {
        setLoginRedirectUrl()
        router.replace(loginRedirectUrl)
      }
    }
  })
  const isLoggedIn = Boolean(user && token)
  const refreshUserData = async () => {
    // Check that the responses are ok here. Otherwise we could end in a bad state
    const {
      response: { token: refreshToken, userId }
    } = await api.user.refreshToken(token)
    setToken(refreshToken)
    const { response: refreshUser } = await api.user.getInfo(userId, token)
    setUser(refreshUser)
  }
  const logOut = () => {
    setUser()
    setToken()
  }
  return {
    user,
    setUser,
    setToken,
    token,
    isLoggedIn,
    refreshUserData,
    logOut,
    setLoginRedirectUrl
  }
}
