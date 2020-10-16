import React from 'react'
import { useLocalStorage } from 'hooks/useLocalStorage'
import api from 'api'
import { useUser } from 'hooks/useUser'

export const ResourceContext = React.createContext({})

export const ResourceContextProvider = ({
  editResource = {},
  localStorageName = 'edit-resource',
  children
}) => {
  // replace the objects with their ids
  const cleanedEditResource = (savedResource) => {
    if (!savedResource.id) return savedResource

    const cleanedResource = { ...savedResource }
    cleanedResource.organization = savedResource.organization.id
    cleanedResource.contact_user = savedResource.contact_user.id
    return cleanedResource
  }

  const [resource, setResource] = useLocalStorage(
    localStorageName,
    cleanedEditResource(editResource)
  )
  const [fetched, setFetched] = useLocalStorage(
    `${localStorageName}-fetched`,
    false
  )

  const [grantOptions, setGrantOptions] = React.useState([])
  const [contactUserOptions, setContactUserOptions] = React.useState([])
  const [teamResources, setTeamResources] = React.useState([])
  const [
    existingRequirementsResource,
    setExistingRequirementsResource
  ] = React.useState('')
  const [errors, setErrors] = React.useState([])
  const { user, token, refreshUser } = useUser()
  const fetchRef = React.useRef(false)
  const refreshRef = React.useRef(false)

  React.useEffect(() => {
    if (!refreshRef.curent) refreshUser()
    refreshRef.current = true
  }, [])

  // this is a propagating fetch so context needs to own it
  const didSetOrganization = async (teamId) => {
    if (!fetchRef.current) {
      fetchRef.current = true
      // set grantOptions when team changes
      const grantsRequest = await api.teams.grants.get(teamId, token)
      const newGrantOptions = grantsRequest.isOk
        ? grantsRequest.response.results
        : []
      setGrantOptions(newGrantOptions)

      // set contactUserOptions when team changes
      const teamRequest = await api.teams.get(teamId, token)
      const members = teamRequest.isOk ? teamRequest.response.members : []
      setContactUserOptions(members)

      // set hasResources when team changes
      const resourcesRequest = await api.resources.filter({
        organization__id: teamId || resource.organization,
        imported: false,
        limit: 20
      })
      setTeamResources(resourcesRequest.response.results)

      fetchRef.current = false
    }
  }

  // explicitly destroy local storage
  const clearResourceContext = () => {
    setResource()
    setFetched()
    setExistingRequirementsResource()
  }

  return (
    <ResourceContext.Provider
      value={{
        user,
        token,
        resource,
        setResource,
        fetched,
        setFetched,
        grantOptions,
        contactUserOptions,
        didSetOrganization,
        errors,
        setErrors,
        clearResourceContext,
        teamResources,
        existingRequirementsResource,
        setExistingRequirementsResource
      }}
    >
      {children}
    </ResourceContext.Provider>
  )
}
