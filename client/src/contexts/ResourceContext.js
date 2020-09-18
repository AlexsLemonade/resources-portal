import React from 'react'
import { useLocalStorage } from 'hooks/useLocalStorage'
import api from 'api'
import { useUser } from 'hooks/useUser'

export const ResourceContext = React.createContext({})

export const ResourceContextProvider = ({
  localStorageName = 'edit-resource',
  children
}) => {
  const [resource, setResource] = useLocalStorage(localStorageName, {})
  const [fetched, setFetched] = useLocalStorage(
    `${localStorageName}-fetched`,
    false
  )

  const [grantOptions, setGrantOptions] = React.useState([])
  const [contactUserOptions, setContactUserOptions] = React.useState([])
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
      fetchRef.current = false
    }
  }

  // explicitly destroy local storage
  const clearResourceContext = () => {
    setResource()
    setFetched()
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
        clearResourceContext
      }}
    >
      {children}
    </ResourceContext.Provider>
  )
}
