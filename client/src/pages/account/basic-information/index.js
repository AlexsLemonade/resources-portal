import React from 'react'
import { Anchor, Box, Button, Paragraph, Text, TextInput } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { HeaderRow } from 'components/HeaderRow'
import { useUser } from 'hooks/useUser'
import Icon from 'components/Icon'

const BasicInformation = () => {
  const { user } = useUser()
  const [newEmail, setNewEmail] = React.useState(user.email)
  const [showEmailForm, setShowEmailForm] = React.useState(false)

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
                onClick={() => {
                  // do api stuff here
                  setNewEmail(newEmail)
                  setShowEmailForm(false)
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
            <Box key={funderId} direction="row" align="center">
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
    </DrillDownNav>
  )
}

export default BasicInformation
