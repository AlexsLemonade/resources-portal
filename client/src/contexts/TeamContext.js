import React from 'react'

export const TeamContext = React.createContext({})

export const TeamContextProvider = ({
  editTeam = {
    name: '',
    description: '',
    members: [],
    grants: []
  },
  children
}) => {
  const [team, setTeam] = React.useState(editTeam)
  const [memberSuggestions, setMemberSuggestions] = React.useState({})
  const [memberEmail, setMemberEmail] = React.useState('')
  const [invites, setInvites] = React.useState([])

  return (
    <TeamContext.Provider
      value={{
        team,
        setTeam,
        memberSuggestions,
        setMemberSuggestions,
        memberEmail,
        setMemberEmail,
        invites,
        setInvites
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}
