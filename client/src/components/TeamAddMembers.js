import React from 'react'
import { Box, Button, FormField, TextInput, Text } from 'grommet'
import TeamMembersTable from 'components/TeamMembersTable'
import useTeamForm from 'hooks/useTeamForm'

export default () => {
  const {
    team,
    removeMember,
    getAttribute,
    memberSuggestions,
    updateMemberSuggestions,
    addMemberOrInvite,
    memberEmail,
    setMemberEmail,
    invites,
    removeInvite
  } = useTeamForm()
  const members = getAttribute('members')

  return (
    <>
      <FormField label="Email">
        <TextInput
          value={memberEmail}
          onChange={({ target: { value } }) => {
            updateMemberSuggestions(value)
            setMemberEmail(value)
          }}
          onSelect={({ suggestion: { value } }) => {
            setMemberEmail(value.email)
          }}
          suggestions={memberSuggestions[memberEmail] || []}
        />
      </FormField>
      <Box pad={{ vertical: 'medium' }} align="start">
        <Button
          primary
          label="Add Member"
          onClick={addMemberOrInvite}
          disabled={memberEmail === ''}
        />
      </Box>
      <Box>
        {members.length > 0 && (
          <Box margin={{ bottom: 'medium' }}>
            <Text weight="bold">Added Memebers</Text>
            <TeamMembersTable team={team} onDelete={removeMember} />
          </Box>
        )}

        {invites.length > 0 && (
          <Box margin={{ bottom: 'medium' }}>
            <Text weight="bold">Invited Members</Text>
            <TeamMembersTable
              team={{ ...team, members: invites }}
              onDelete={removeInvite}
            />
          </Box>
        )}
      </Box>
    </>
  )
}
