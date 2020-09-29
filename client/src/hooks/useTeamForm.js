import React from 'react'
import { useUser } from 'hooks/useUser'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { TeamContext } from 'contexts/TeamContext'
import api from 'api'

export default () => {
  const { addAlert } = useAlertsQueue()
  const { user, token, refreshUser } = useUser()
  const {
    team,
    setTeam,
    memberSuggestions,
    setMemberSuggestions,
    memberEmail,
    setMemberEmail,
    invites,
    setInvites
  } = React.useContext(TeamContext)

  React.useEffect(() => {
    refreshUser()
  }, [])

  const fetchTeam = async (teamId) => {
    const teamRequest = await api.teams.get(teamId, token)
    if (teamRequest.isOk) {
      setTeam(teamRequest.response)
    }
  }

  const updateMemberSuggestions = async (email) => {
    if (!Object.keys(memberSuggestions).includes(email)) {
      const updatedMemberSuggestions = { ...memberSuggestions }
      const membersRequest = await api.search.users({ search: email }, token)
      if (membersRequest.isOk) {
        updatedMemberSuggestions[email] = membersRequest.response.results.map(
          (u) => ({
            label: `${u.full_name} <${u.email}>`,
            value: u
          })
        )
        setMemberSuggestions(updatedMemberSuggestions)
      }
    }
  }

  const addMemberOrInvite = () => {
    // validate email first
    const allSuggestions = [].concat(...Object.values(memberSuggestions))
    // try to find a member
    const suggestion = allSuggestions.find((s) => s.value.email === memberEmail)
    if (suggestion) {
      if (suggestion.value.id === user.id) {
        addAlert('You are a member of this team by default.', 'error')
      } else {
        const newMembers = [...team.members, suggestion.value]
        setTeam({ ...team, members: newMembers })
      }
    } else {
      setInvites([...invites, memberEmail])
    }

    setMemberEmail('')
  }

  const removeMember = (member) => {
    const newMembers = team.members.filter((m) => member.id !== m.id)
    setTeam({ ...team, members: newMembers })
  }

  const removeInvite = (invite) => {
    const newInvites = invites.filter((i) => i !== invite)
    setInvites(newInvites)
  }

  const setAttribute = (attribute, value) => {
    setTeam({ ...team, [attribute]: value })
  }

  const getAttribute = (attribute) => {
    return team[attribute]
  }

  const inviteMembers = () => {}

  const saveMembers = async (newTeamId) => {
    const teamId = newTeamId || team.id
    const availableMemberIds = (getAttribute('members') || [])
      .filter((m) => !!m.id)
      .map((m) => m.id)
    const teamRequest = await api.teams.get(teamId, token)
    if (teamRequest.isOk) {
      const existingMemberIds = teamRequest.response.members
        .map((m) => m.id)
        .filter((m) => m !== user.id)
      const addMemberIds = availableMemberIds.filter(
        (m) => !existingMemberIds.includes(m.id)
      )
      const removeMemberIds = existingMemberIds.filter(
        (memberId) => !availableMemberIds.includes(memberId)
      )
      await Promise.all(
        addMemberIds.map((memberId) => {
          const invitation = {
            invite_or_request: 'INVITE',
            organization: teamId,
            request_receiver: memberId,
            requester: user.id
          }
          return api.teams.members.invite(invitation, token)
        })
      )
      await Promise.all(
        removeMemberIds.map((memberId) =>
          api.teams.members.remove(teamId, memberId, token)
        )
      )
    }
  }

  const saveGrants = async (newTeamId) => {
    const teamId = newTeamId || team.id
    const grantIds = getAttribute('grants').map((g) => g.id)
    const grantsRequest = await api.teams.grants.get(teamId, token)
    if (grantsRequest.isOk && grantsRequest.response) {
      const existingGrantIds = grantsRequest.response.results.map((m) => m.id)
      const newGrantIds = grantIds.filter(
        (grantId) => !existingGrantIds.includes(grantId)
      )
      const removeGrantIds = existingGrantIds.filter(
        (grantId) => !grantIds.includes(grantId)
      )
      await Promise.all(newGrantIds.map((grantId) => addGrant(teamId, grantId)))
      await Promise.all(
        removeGrantIds.map((grantId) => removeGrant(teamId, grantId))
      )
    }
  }

  const addGrant = (teamId, grantId) =>
    api.teams.grants.add(teamId, grantId, token)
  const removeGrant = (teamId, grantId) =>
    api.teams.grants.remove(teamId, grantId, token)

  const sendEmailInvite = (email) => api.invite(email, token)

  const save = async () => {
    const teamRequest = team.id
      ? await api.teams.update(team.id, team, token)
      : await api.teams.create({ ...team, owner: user }, token)

    if (teamRequest.isOk) {
      const {
        response: { id }
      } = teamRequest
      await Promise.all([
        saveMembers(id),
        saveGrants(id),
        ...invites.map(sendEmailInvite)
      ])
    } else {
      return false
    }

    return true
  }

  return {
    user,
    team,
    setTeam,
    setAttribute,
    getAttribute,
    updateMemberSuggestions,
    memberSuggestions,
    inviteMembers,
    save,
    addMemberOrInvite,
    memberEmail,
    setMemberEmail,
    removeMember,
    removeInvite,
    invites,
    fetchTeam,
    teamFetched: !!team.id,
    addGrant,
    removeGrant
  }
}
