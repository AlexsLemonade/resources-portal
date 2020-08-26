import * as React from 'react'
import { Grommet } from 'grommet'
import { storiesOf } from '@storybook/react'
import { Loader } from './Loader'
import theme from '../theme'

storiesOf('Loader', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Loader />
    </Grommet>
  )
})
