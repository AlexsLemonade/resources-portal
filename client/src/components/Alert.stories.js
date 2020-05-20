import * as React from 'react'
import { Grommet, Box, Button } from 'grommet'
import { storiesOf } from '@storybook/react'
import { useAlertsQueue } from '../hooks/useAlertsQueue'
import { Alert, AlertsWithQueue } from './Alert'
import theme from '../theme'

storiesOf('Alert', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="medium">
        <Alert type="info" message="This is information." />
      </Box>
      <Box pad="medium">
        <Alert type="success" message="This worked out well!" />
      </Box>
      <Box pad="medium">
        <Alert type="error" message="This is an error!" />
      </Box>
    </Grommet>
  )
})

storiesOf('Alert', module).add('Alerts', () => {
  const alertsQueue = useAlertsQueue('demo1')

  // This is to demonstate how you can use queues and context
  // This would be in some child component or somewhere else
  const { addAlert } = useAlertsQueue('demo1')
  return (
    <Grommet theme={theme}>
      <AlertsWithQueue queue={alertsQueue} />
      <Box pad="medium" direction="row">
        <Button
          label="Add Success Alert"
          width="50px"
          onClick={() => {
            alertsQueue.addAlert('New Alert!', 'success')
          }}
        />
      </Box>
      <Box pad="medium" direction="row">
        <Button
          label="Add Error Alert"
          width="50px"
          onClick={() => {
            addAlert('New Error Alert!', 'error')
          }}
        />
      </Box>
      <Box pad="medium" direction="row">
        <Button
          label="Add Info Alert"
          width="50px"
          onClick={() => {
            addAlert('New Info Alert!', 'info')
          }}
        />
      </Box>
    </Grommet>
  )
})
