import React from 'react'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const useUser = () => {
  const { user, setUser } = React.useContext(ResourcesPortalContext)
  const { token, setToken } = React.useState(user ? user.token : null)
  const loginUser = (orcidToken) => {
    // set token in for restricted api endpoints
    // make api calls here
  }
  const isLoggedIn = () => {
    return user && user.token
  }
  const refreshUserData = () => {
    // api calls to refresh data
  }
  return {
    user,
    isLoggedIn
  }
}
