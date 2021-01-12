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
  const {
    user,
    team,
    removeMember,
    leaveTeam,
    transferOwnership,
    invites,
    save
  } = useTeamForm()
  const [showTeamModal, setShowTeamModal] = React.useState(false)
  const saveRef = React.useRef(false)

  React.useEffect(() => {
    const saveTeam = async (message) => {
      saveRef.current = false
      if (await save()) {
        addAlert(message, 'success')
      } else {
        addAlert('An error occurred while saving. Please refresh.', 'error')
      }
    }
    if (saveRef.current) saveTeam(saveRef.current)
  })

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
                  setShowTeamModal(false)
                  saveRef.current =
                    invites.length > 0 ? 'Invites Sent' : 'Saved Changes'
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
          if (user.id === member.id) {
            leaveTeam(member)
          } else {
            removeMember(member)
            saveRef.current = 'Member Removed'
          }
        }}
        onTransferOwner={(newOwner) => {
          transferOwnership(newOwner)
          saveRef.current = 'New Owner Saved'
        }}
      />
    </Box>
  )
}
