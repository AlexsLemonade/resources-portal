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

  const updateEmail = async (email) => {
    const updateRequest = await api.user.update(user.id, { email }, token)
    if (updateRequest.isOk) refreshUser()
    return updateRequest.isOk
  }

  const getTeam = (teamOrId) => {
    const teamId = teamOrId.id || teamOrId
    if (user.organizations) {
      return user.organizations.find((t) => t.id === teamId)
    }

    return teamId
  }

  const isPersonalResource = (resource) => {
    if (typeof resource.organization === 'number') {
      return resource.organization === user.personal_organization.id
    }
    if (typeof resource.organization.id === 'object') {
      return resource.organization.id === user.personal_organization.id
    }

    // there was no way to tell
    // since no org was defined
    return false
  }

  const isResourceRequester = (request) => {
    if (typeof request.requester === 'number') {
      return request.requester === user.id
    }

    return request.requester.id === user.id
  }

  const isAssignedRequest = (request) => {
    if (typeof request.assigned_to === 'string') {
      return request.assigned_to === user.id
    }

    return request.assigned_to.id === user.id
  }

  return {
    user,
    setUser,
    setToken,
    token,
    isLoggedIn,
    refreshUserData,
    refreshUser,
    updateEmail,
    logOut,
    getTeam,
    isPersonalResource,
    isResourceRequester,
    isAssignedRequest
  }
}
