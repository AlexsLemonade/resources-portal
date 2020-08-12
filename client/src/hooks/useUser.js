import React from 'react'
import api from '../api'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const useUser = (defaultUser, defaultToken) => {
  const { user, setUser, token, setToken } = React.useContext(
    ResourcesPortalContext
  )
  function getUser() {
    return defaultUser
  }
  const isLoggedIn = () => {
    return user && user.token
  }
  const refreshUserData = () => {
    const { currentToken, userId } = api.user.refreshToken(token)
    const currentUser = api.user.getInfo(userId)
  }
  return {
    getUser,
    isLoggedIn,
    refreshUserData
  }
}
