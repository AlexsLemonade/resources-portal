import React from 'react'
import { Anchor, Box, Button, Paragraph, Text, TextInput } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { HeaderRow } from 'components/HeaderRow'
import { useUser } from 'hooks/useUser'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { Modal } from 'components/Modal'
import Icon from 'components/Icon'

const BasicInformation = () => {
  const { user, refreshUser, updateEmail, isLoggedIn, logOut } = useUser()
  const [newEmail, setNewEmail] = React.useState(user.email)
  const [showEmailForm, setShowEmailForm] = React.useState(false)
  const { addAlert } = useAlertsQueue()
  const [showLogOutModal, setShowLogOutModal] = React.useState(false)

  React.useEffect(() => {
    if (isLoggedIn) refreshUser()
  }, [])

  return (
    <DrillDownNav title="Basic Information">
      <Box>
        <Box>
          <Text weight="bold">Full Name</Text>
          <Text margin={{ top: 'medium' }}>{user.full_name}</Text>
        </Box>
        <Box margin={{ top: 'large' }}>
          <Text weight="bold">ORCID</Text>
          <Text margin={{ top: 'medium' }}>{user.orcid}</Text>
        </Box>
        <Box margin={{ top: 'large' }}>
          <Text weight="bold">Contact Email</Text>
          {!showEmailForm && (
            <Box direction="row" gap="medium">
              <Text margin={{ top: 'medium' }}>
                {user.email || 'not available'}
              </Text>
              <Anchor
                margin={{ top: 'medium' }}
                label="change"
                href="#"
                onClick={() => setShowEmailForm(true)}
              />
            </Box>
          )}
          {showEmailForm && (
            <Box direction="row" gap="medium" margin={{ top: 'medium' }}>
              <TextInput
                type="email"
                placeholder="type here"
                value={newEmail}
                onChange={({ target: { value } }) => setNewEmail(value)}
              />
              <Button
                label="Save"
                onClick={async () => {
                  const saved = await updateEmail(newEmail)
                  if (saved) setShowEmailForm(false)
                  if (!saved) addAlert('Unable to set email.', 'error')
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box margin={{ top: 'large' }}>
        <HeaderRow label="Grants Awarded" />
        {user.grants.length === 0 && <Paragraph>You have no grants.</Paragraph>}
        {user.grants.length !== 0 &&
          user.grants.map(({ title, funder_id: funderId }) => (
            <Box key={`${title}-${funderId}`} direction="row" align="center">
              <Icon color="plain" name="Grant" />
              <Box pad={{ left: 'small' }}>
                <Paragraph margin="none">{title}</Paragraph>
                <Paragraph size="small">Grant ID:{funderId}</Paragraph>
              </Box>
            </Box>
          ))}
      </Box>
      <Box align="end">
        <Button
          onClick={() => {
            console.log(user.id)
          }}
          label="Report Missing / Incomplete Info"
        />
      </Box>
      <Box margin={{ vertical: 'xlarge' }} align="start">
        <Button
          critical
          label="Log Out"
          onClick={() => {
            setShowLogOutModal(true)
          }}
        />
        <Modal
          title="Log Out"
          showing={showLogOutModal}
          setShowing={setShowLogOutModal}
        >
          <Box width="medium">
            <Text size="large">Are you sure you want to log out?</Text>
            <Box
              margin={{ vertical: 'medium' }}
              justify="end"
              gap="medium"
              direction="row"
            >
              <Button
                label="Cancel"
                onClick={() => setShowLogOutModal(false)}
              />
              <Button critical label="Confirm" onClick={logOut} />
            </Box>
          </Box>
        </Modal>
      </Box>
    </DrillDownNav>
  )
}

export default BasicInformation
