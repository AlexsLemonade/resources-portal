import React from 'react'
import { Box, Button, Paragraph, Text } from 'grommet'
import { Modal } from 'components/Modal'
import { InfoCard } from 'components/InfoCard'

export default ({ showing, setShowing, team, onLeaveTeam }) => {
  const leaveTeam = () => {
    setShowing(false)
    onLeaveTeam(true)
  }

  return (
    <Modal
      critical
      title="Transfer Owner"
      showing={showing}
      setShowing={setShowing}
    >
      <Box width="large">
        <InfoCard elevation="none" type="Warning" iconColor="error">
          <Paragraph>
            Are you sure you want to leave{' '}
            <Text weight="bold">{team.name}</Text>?
          </Paragraph>
          <Paragraph>
            <Text weight="bold">You cannot revert this change.</Text>{' '}
          </Paragraph>
        </InfoCard>
        <Box direction="row" justify="end" gap="medium">
          <Button label="Cancel" onClick={() => setShowing(false)} />
          <Button primary label="Yes" onClick={leaveTeam} />
        </Box>
      </Box>
    </Modal>
  )
}
