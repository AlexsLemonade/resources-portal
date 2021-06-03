import React from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'

export const ResourcesPortalContext = React.createContext({})

export const ResourcesPortalContextProvider = ({ children }) => {
  const [search, setSearch] = React.useState({})
  const [user, setUser] = useLocalStorage('user', undefined)
  const [token, setToken] = useLocalStorage('token', '')
  const [alertsQueues, setAlertsQueues] = React.useState({})
  const [notificationCount, setNotificationCount] = React.useState(0)

  // used to prevent default redirect after login in pages/account/index.js
  // updated by useCreateUser login flow
  const skipAccountRedirectRef = React.useRef(false)

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
        notificationCount,
        setNotificationCount,
        skipAccountRedirectRef
      }}
    >
      {children}
    </ResourcesPortalContext.Provider>
  )
}
