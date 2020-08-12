import React from 'react'

export const ResourcesPortalContext = React.createContext({})

export const ResourcesPortalContextProvider = ({ children }) => {
  const [search, setSearch] = React.useState({})
  const [user, setUser] = React.useState({})
  const [token, setToken] = React.useState('')

  return (
    <ResourcesPortalContext.Provider
      value={{ search, setSearch, user, setUser, token, setToken }}
    >
      {children}
    </ResourcesPortalContext.Provider>
  )
}
