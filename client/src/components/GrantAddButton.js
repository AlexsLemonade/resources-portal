import React from 'react'
import { Box, CheckBox, Paragraph, Text } from 'grommet'
import Button from 'components/Button'
import { Modal } from 'components/Modal'
import useTeamForm from 'hooks/useTeamForm'

export default () => {
  const {
    user: { grants: userGrants },
    fetchTeam,
    addGrant,
    team: { grants: teamGrants, id: teamId }
  } = useTeamForm()

  const [showAddGrantsModal, setShowAddGrantsModal] = React.useState(false)

  const [grantIdsToAdd, setGrantIdsToAdd] = React.useState([])
  const existingGrantIds = teamGrants.map((g) => g.id)
  const checkedGrantIds = [...existingGrantIds, ...grantIdsToAdd]

  const toggleGrant = (grantId, toggle) => {
    const newGrantsToAdd = toggle
      ? [...grantIdsToAdd, grantId]
      : grantIdsToAdd.filter((id) => id !== grantId)
    setGrantIdsToAdd(newGrantsToAdd)
  }

  const syncSelectedGrants = async () => {
    await Promise.all(grantIdsToAdd.map((id) => addGrant(teamId, id)))
    await fetchTeam(teamId)
  }

  return (
    <>
      <Button
        alignSelf="end"
        primary
        label="Link Grants"
        onClick={() => setShowAddGrantsModal(true)}
      />
      <Modal showing={showAddGrantsModal} setShowing={setShowAddGrantsModal}>
        <Box width="large">
          <Box border={{ side: 'bottom' }} margin={{ bottom: 'medium' }}>
            <Text serif size="xlarge">
              Link Grants
            </Text>
          </Box>
          <Text>
            Members of your team may only add resources and manage requests
            linked with a particular grant. Select the grant(s) below to
            associate with this team.
          </Text>
          <Text weight="bold" margin={{ vertical: 'medium' }}>
            Grants awarded to you (choose as many as appropriate)
          </Text>
          {userGrants.length === 0 && (
            <Paragraph>
              <Text italic color="black-tint-40">
                You have no grants.
              </Text>
            </Paragraph>
          )}
          {userGrants.map((grant) => (
            <CheckBox
              key={grant.id}
              label={grant.title}
              disabled={existingGrantIds.includes(grant.id)}
              checked={checkedGrantIds.includes(grant.id)}
              onChange={({ target: { checked } }) => {
                toggleGrant(grant.id, checked)
              }}
            />
          ))}
          <Button
            primary
            alignSelf="end"
            margin={{ vertical: 'medium' }}
            label="Done"
            onClick={async () => {
              await syncSelectedGrants()
              setShowAddGrantsModal(false)
            }}
          />
        </Box>
      </Modal>
    </>
  )
}
