import React from 'react'
import { useRouter } from 'next/router'
import { useUser } from 'hooks/useUser'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { TeamContext } from 'contexts/TeamContext'
import api from 'api'

export default () => {
  const router = useRouter()
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

  const transferOwnership = (newOwner) => {
    setTeam({ ...team, owner: newOwner })
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

  const saveMembers = async (newTeamId) => {
    const teamId = newTeamId || team.id
    const availableMemberIds = (getAttribute('members') || [])
      .filter((m) => !!m.id)
      .map((m) => m.id)
    const teamRequest = await api.teams.get(teamId, token)
    if (teamRequest.isOk) {
      const existingMemberIds = teamRequest.response.members.map((m) => m.id)
      const addMemberIds = availableMemberIds.filter(
        (m) => !existingMemberIds.includes(m)
      )
      const removeMemberIds = existingMemberIds
        .filter((m) => !availableMemberIds.includes(m))
        .filter((m) => m !== user.id)

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
  const removeGrant = (teamId, grantId, query = { transfer: false }) =>
    api.teams.grants.remove(teamId, grantId, query, token)

  const sendEmailInvite = (email) => api.invitations.create(email, token)

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
      return teamRequest.response
    }

    return false
  }

  const leaveTeam = async (member) => {
    if (member.id === team.owner.id) {
      addAlert('Owners must transfer their team to a new owner.', 'error')
      return false
    }
    const { isOk } = await api.teams.members.remove(team.id, member.id, token)
    if (isOk) {
      addAlert('You have left the team successfully.', 'success')
      await refreshUser()
      router.push('/account/teams')
      return true
    }
    addAlert('An error occurred when saving please try again later', 'error')
    return false
  }

  return {
    user,
    team,
    setTeam,
    setAttribute,
    getAttribute,
    updateMemberSuggestions,
    memberSuggestions,
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
    removeGrant,
    transferOwnership,
    leaveTeam
  }
}
