import React from 'react'
import {
  Box,
  Button,
  Paragraph,
  RadioButtonGroup,
  RadioButton,
  Text
} from 'grommet'
import { Modal } from 'components/Modal'
import { useUser } from 'hooks/useUser'
import getMemberOptions from 'helpers/getMembersOptions'
import { InfoCard } from 'components/InfoCard'

export default ({ showing, setShowing, members, onTransferOwner }) => {
  const { user } = useUser()
  const [newOwner, setNewOwner] = React.useState({})
  const [showConfirm, setShowConfirm] = React.useState(false)

  // filter out owner
  const newOwnerOptions = getMemberOptions(
    members.filter((m) => m.id !== user.id)
  )

  const changeOwner = () => {
    setShowing(false)
    onTransferOwner(newOwner)
  }

  return (
    <Modal
      critical
      title="Transfer Owner"
      showing={showing}
      setShowing={setShowing}
    >
      <Box width="large">
        {!showConfirm ? (
          <>
            <Text weight="bold">
              You will no longer be able to add/remove members, and remove
              resources.{' '}
            </Text>
            <Text>
              You will still be a member of the team and be able add, edit,
              archive resources and respond to resource requests.
            </Text>
            <RadioButtonGroup name="new-owner" options={newOwnerOptions}>
              {({ member, ...option }, { hover }) => (
                <RadioButton
                  key={option.label}
                  name={option.name}
                  hover={hover}
                  checked={newOwner.id === option.value}
                  value={option.value}
                  label={member.full_name}
                  onChange={() => setNewOwner(member)}
                />
              )}
            </RadioButtonGroup>
            <Box direction="row" justify="end" gap="medium">
              <Button label="Cancel" onClick={() => setShowing(false)} />
              <Button
                critical
                label="Transfer Ownership"
                disabled={!newOwner.id}
                onClick={() => setShowConfirm(true)}
              />
            </Box>
          </>
        ) : (
          <>
            <InfoCard elevation="none" type="Warning" iconColor="error">
              <Paragraph>
                Are you sure you want to transfer ownership to{' '}
                <Text weight="bold">{newOwner.full_name}</Text>?
              </Paragraph>
              <Paragraph>
                <Text weight="bold">You cannot revert this change.</Text>{' '}
              </Paragraph>
            </InfoCard>
            <Box direction="row" justify="end" gap="medium">
              <Button label="Cancel" onClick={() => setShowConfirm(false)} />
              <Button primary label="Yes" onClick={changeOwner} />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  )
}
