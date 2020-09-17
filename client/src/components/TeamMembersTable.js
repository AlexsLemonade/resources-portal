import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import { useUser } from 'hooks/useUser'
import Icon from 'components/Icon'
import TableButton from 'components/TableButton'

export default ({ team, onDelete }) => {
  const { user } = useUser()
  const areOwner = !team.owner || team.owner.id === user.id
  const canTransfer = team.members.length > 1
  const isOwner = (member) => {
    return member.id === user.id
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
            {areOwner && !isOwner(member) && (
              <TableButton
                plain
                color="error"
                icon={<Icon name="Trashcan" color="error" size="small" />}
                label="Remove"
                margin={{ right: 'medium' }}
                onClick={() => onDelete(member)}
              />
            )}
            {areOwner && canTransfer && isOwner(member) && (
              <TableButton
                plain
                icon={<Icon name="TransferMember" color="error" size="small" />}
                label="Transfer Ownership"
                color="error"
                size="small"
                margin={{ right: 'medium' }}
              />
            )}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
