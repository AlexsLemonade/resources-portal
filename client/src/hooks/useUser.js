import React from 'react'
import { useRouter } from 'next/router'
import api from 'api'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const useUser = (defaultUser, defaultToken) => {
  const { user, setUser, token, setToken } = React.useContext(
    ResourcesPortalContext
  )

  const router = useRouter()
  const { addAlert } = useAlertsQueue()

  React.useEffect(() => {
    if ((!user || !user.id) && token) logOut()
    if (defaultUser && defaultToken) {
      setUser(defaultUser)
      setToken(defaultToken)
    }
  })

  const isLoggedIn = Boolean(user && token)

  const fetchUserWithOrcidDetails = async (orcidDetails) => {
    // get token information from orcid details
    const {
      isOk: authIsOk,
      response: authenticated
    } = await api.users.authenticate(orcidDetails)

    if (authIsOk) {
      return fetchUserWithNewToken(authenticated.user_id, authenticated.token)
    }

    return authIsOk
  }

  const fetchUserWithNewToken = async (userId, newToken) => {
    const { response: freshUser, isOk: userIsOk } = await api.users.get(
      userId,
      newToken
    )
    if (userIsOk) {
      setUser(freshUser)
      setToken(newToken)
      addAlert('Successfully logged in', 'success')
    }
    return userIsOk
  }

  const refreshUser = async () => {
    const { response: freshUser, isOk: userIsOk } = await api.users.get(
      user.id,
      token
    )
    if (userIsOk) {
      setUser(freshUser)
    }
    return userIsOk
  }

  const logOut = () => {
    setUser()
    setToken()
    // remove all localStorage keys
    // this will prevent cross contaminating user sessions
    window.localStorage.clear()
    router.push('/')
  }

  const updateEmail = async (email) => {
    const updateRequest = await api.users.update(user.id, { email }, token)
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

  const isAbleToAddResources = async () => {
    if (!isLoggedIn) return false

    const { response: freshUser, isOk: userIsOk } = await api.users.get(
      user.id,
      token
    )

    if (!userIsOk) return false

    // user has grants
    const { grants, organizations: teams } = freshUser

    const hasGrants = grants.length > 0
    // join all the arrays of org grants to one array and check if empty
    const hasTeamGrants = [].concat(...teams.map((t) => t.grants)).length > 0

    return hasGrants || hasTeamGrants
  }

  return {
    user,
    setUser,
    setToken,
    token,
    isLoggedIn,
    fetchUserWithOrcidDetails,
    fetchUserWithNewToken,
    refreshUser,
    updateEmail,
    logOut,
    getTeam,
    isPersonalResource,
    isResourceRequester,
    isAssignedRequest,
    isAbleToAddResources
  }
}
