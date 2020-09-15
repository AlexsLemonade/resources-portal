import React from 'react'
import {
  Box,
  Button,
  CheckBox,
  FormField,
  TextInput,
  Text,
  TextArea
} from 'grommet'
import Link from 'next/link'
import { HeaderRow } from 'components/HeaderRow'
import TeamMembersTable from 'components/TeamMembersTable'
import useTeamForm from 'hooks/useTeamForm'
import { useRouter } from 'next/router'

export default ({ teamId }) => {
  const {
    user,
    team,
    setAttribute,
    getAttribute,
    fetchTeam,
    memberSuggestions,
    updateMemberSuggestions,
    save,
    addMemberOrInvite,
    removeMember,
    memberEmail,
    setMemberEmail,
    invites,
    removeInvite
  } = useTeamForm()
  const members = getAttribute('members')
  const router = useRouter()
  React.useEffect(() => {
    if (teamId) fetchTeam(teamId)
  }, [teamId])

  return (
    <>
      <Box>
        <FormField label="Name your team">
          <TextInput
            value={getAttribute('name')}
            onChange={({ target: { value } }) => setAttribute('name', value)}
          />
        </FormField>
        <FormField label="Description">
          <TextArea
            value={getAttribute('description')}
            onChange={({ target: { value } }) => {
              setAttribute('description', value)
            }}
          />
        </FormField>
      </Box>
      <Box>
        <HeaderRow label="Add Members" />
        <Text>
          All members can add, edit, and archive resources and respond to
          request requirements. Only the owner (you) can add new members and
          remove resources.
        </Text>
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
      <Box>
        {user.grants.length === 0 && (
          <Text color="black-tint-60" italic>
            You have no ALSF grants.
          </Text>
        )}
        {user.grants.length > 0 && (
          <>
            <HeaderRow label="Link Grants" />
            <Text>
              Members of your team may only add resources and manage requests
              associated with a particular grant. Select the grant(s) below to
              associate with this team.
            </Text>
            <Text weight="bold" margin={{ vertical: 'small' }}>
              Grants awarded to you (choose as many as appropriate)
            </Text>
            {user.grants.map((grant) => (
              <CheckBox
                key={grant.id}
                label={grant.title}
                checked={getAttribute('grants')
                  .map((g) => g.id)
                  .includes(grant.id)}
                onChange={({ target: { checked } }) => {
                  const newGrants = checked
                    ? [...getAttribute('grants'), grant]
                    : getAttribute('grants').filter((g) => g.id !== grant.id)
                  setAttribute('grants', newGrants)
                }}
              />
            ))}
          </>
        )}
      </Box>
      <Box
        margin={{ vertical: 'large' }}
        justify="end"
        gap="large"
        direction="row"
      >
        <Link href="/account/teams">
          <Button label="Cancel" />
        </Link>
        <Button
          primary
          label="Create Team"
          onClick={async () => {
            const saved = await save()
            if (saved) router.push('/account/teams')
          }}
        />
      </Box>
    </>
  )
}
