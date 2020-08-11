import React from 'react'

export const ResourcesPortalContext = React.createContext({})

export const ResourcesPortalContextProvider = ({ children }) => {
  const [search, setSearch] = React.useState({})
  const [user, setUser] = React.useState({})

  return (
    <ResourcesPortalContext.Provider
      value={{ search, setSearch, user, setUser }}
    >
      {children}
    </ResourcesPortalContext.Provider>
  )
}
