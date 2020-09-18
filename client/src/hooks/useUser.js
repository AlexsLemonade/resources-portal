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
    const { response: refreshUser, isOk: userIsOk } = await api.user.get(
      user.id,
      token
    )
    if (userIsOk) {
      setUser(refreshUser)
    }
  }

  const refreshUser = async () => {
    const { response: freshUser, isOk: userIsOk } = await api.user.get(
      user.id,
      token
    )
    if (userIsOk) {
      setUser(freshUser)
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
    refreshUser,
    logOut
  }
}
