import React from 'react'

export const ResourcesPortalContext = React.createContext({})

export const ResourcesPortalContextProvider = ({ children }) => {
  const [search, setSearch] = React.useState({})

  return (
    <ResourcesPortalContext.Provider value={{ search, setSearch }}>
      {children}
    </ResourcesPortalContext.Provider>
  )
}
