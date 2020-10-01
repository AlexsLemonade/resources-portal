import React from 'react'
import { Box, Button, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import TeamMembersTable from 'components/TeamMembersTable'
import useTeamForm from 'hooks/useTeamForm'
import { Modal } from 'components/Modal'
import TeamAddMembers from 'components/TeamAddMembers'
import { useAlertsQueue } from 'hooks/useAlertsQueue'

export default () => {
  const { addAlert } = useAlertsQueue()
  const { team, removeMember, invites, save } = useTeamForm()
  const [showTeamModal, setShowTeamModal] = React.useState(false)
  const saveChanges = async (message) => {
    if (await save()) {
      addAlert(message, 'success')
    } else {
      addAlert('An error occurred while saving. Please refresh.', 'error')
    }
  }
  return (
    <Box pad={{ vertical: 'medium' }}>
      {team.members.length === 0 && (
        <Text italic color="black-tint-60">
          You have no members.
        </Text>
      )}
      <Box direction="row" justify="end">
        <Button label="Add Members" onClick={() => setShowTeamModal(true)} />
        <Modal
          showing={showTeamModal}
          setShowing={setShowTeamModal}
          title="Add Members"
        >
          <Box width="large">
            <TeamAddMembers showActions={false} />
            <Box direction="row" justify="end">
              <Button
                label="Done"
                onClick={async () => {
                  if (invites.length) {
                    await saveChanges('Invites Sent')
                  }
                  setShowTeamModal(false)
                }}
              />
            </Box>
          </Box>
        </Modal>
      </Box>
      <HeaderRow label={`Members (${team.members.length})`} />
      <TeamMembersTable
        team={team}
        onDelete={(member) => {
          removeMember(member)
          saveChanges('Member Removed')
        }}
      />
    </Box>
  )
}
