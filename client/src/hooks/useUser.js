import React from 'react'
import api from '../api'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const useUser = (defaultUser, defaultToken) => {
  const { user, setUser, token, setToken } = React.useContext(
    ResourcesPortalContext
  )
  React.useEffect(() => {
    if (defaultUser && defaultToken) {
      setUser(defaultUser)
      setToken(defaultToken)
    }
  })
  const isLoggedIn = Boolean(user && token)
  const refreshUserData = async () => {
    const {
      response: { token: refreshToken, userId, isOk: tokenIsOk }
    } = await api.user.refreshToken(token)
    if (tokenIsOk) {
      setToken(refreshToken)
    }

    const { response: refreshUser, isOk: userIsOk } = await api.user.getInfo(
      userId,
      token
    )
    if (userIsOk) {
      setUser(refreshUser)
    }
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
    logOut
  }
}
