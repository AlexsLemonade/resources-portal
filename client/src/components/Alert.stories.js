import * as React from 'react'
import { Grommet } from 'grommet'
import { storiesOf } from '@storybook/react'
import { Alert } from './Alert'
import theme from '../theme'

storiesOf('Alert', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Alert type="info" message="This is information." />
      <Alert type="success" message="This worked out well!" />
      <Alert type="error" message="This is an error!" />
    </Grommet>
  )
})
