import * as React from 'react'
import { Grommet, Box, Button } from 'grommet'
import { storiesOf } from '@storybook/react'
import { Alert, useAlerts } from './Alert'
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
  const { addAlert, Alerts } = useAlerts('demo1')

  // This is to demonstate how you can use queues and context
  const { addAlert: addAnotherAlert } = useAlerts('demo1')
  return (
    <Grommet theme={theme}>
      <Alerts />
      <Box pad="medium" direction="row">
        <Button
          label="Add Success Alert"
          width="50px"
          onClick={() => {
            addAlert('New Alert!', 'success')
          }}
        />
      </Box>
      <Box pad="medium" direction="row">
        <Button
          label="Add Error Alert"
          width="50px"
          onClick={() => {
            addAnotherAlert('New Error Alert!', 'error')
          }}
        />
      </Box>
      <Box pad="medium" direction="row">
        <Button
          label="Add Info Alert"
          width="50px"
          onClick={() => {
            addAnotherAlert('New Info Alert!', 'info')
            // or addAnotherAlert('New Info Alert!')
          }}
        />
      </Box>
    </Grommet>
  )
})
