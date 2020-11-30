import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import { useUser } from 'hooks/useUser'
import Icon from 'components/Icon'
import TableButton from 'components/TableButton'
import TeamMembersChangeOwner from 'components/TeamMembersChangeOwner'

export default ({ team, onDelete, onTransferOwner }) => {
  const { user } = useUser()
  const [showTransferOwner, setShowTransferOwner] = React.useState(false)
  const canTransfer = team.members.length > 1
  const userIsOwner = !team.owner || team.owner.id === user.id
  const memberIsUser = (member) => {
    return member.id === user.id
  }
  const memberIsOwner = (member) => {
    return team.owner && member.id === team.owner.id
  }

  return (
    <Box width="full">
      {team.members.map((member, i) => (
        <Box
          key={member.id || member}
          direction="row"
          justify="between"
          background={i % 2 !== 0 ? 'black-tint-95' : 'white'}
          pad={{ vertical: 'medium', horizontal: '3px' }}
        >
          <Box textAlign="start" direction="row">
            {member.full_name && <Text>{member.full_name} </Text>}{' '}
            {member.email && (
              <Anchor
                href={`mailto:${member.email}`}
                label={`<${member.email}>`}
              />
            )}
            {typeof member === 'string' && (
              <Anchor href={`mailto:${member}`} label={member} />
            )}
          </Box>
          <Box textAlign="end">
            {userIsOwner && !memberIsUser(member) && (
              <TableButton
                plain
                color="error"
                icon={<Icon name="Trashcan" color="error" size="small" />}
                label="Remove"
                margin={{ right: 'medium' }}
                onClick={() => onDelete(member)}
              />
            )}
            {userIsOwner && canTransfer && memberIsUser(member) && (
              <>
                <TableButton
                  plain
                  icon={
                    <Icon name="TransferMember" color="error" size="small" />
                  }
                  label="Transfer Ownership"
                  color="error"
                  size="small"
                  margin={{ right: 'medium' }}
                  onClick={() => setShowTransferOwner(true)}
                />
                <TeamMembersChangeOwner
                  showing={showTransferOwner}
                  setShowing={setShowTransferOwner}
                  onTransferOwner={onTransferOwner}
                  members={team.members}
                />
              </>
            )}
            {memberIsOwner(member) && !userIsOwner && (
              <Text italic color="black-tint-60">
                (Owner)
              </Text>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
