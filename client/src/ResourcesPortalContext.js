import React from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'

export const ResourcesPortalContext = React.createContext({})

export const ResourcesPortalContextProvider = ({ children }) => {
  const [search, setSearch] = React.useState({})
  const [user, setUser] = useLocalStorage('user', undefined)
  const [token, setToken] = useLocalStorage('token', '')
  const [alertsQueues, setAlertsQueues] = React.useState({})
  const [notifications, setNotifications] = React.useState()

  return (
    <ResourcesPortalContext.Provider
      value={{
        search,
        setSearch,
        user,
        setUser,
        token,
        setToken,
        alertsQueues,
        setAlertsQueues,
        notifications,
        setNotifications
      }}
    >
      {children}
    </ResourcesPortalContext.Provider>
  )
}
