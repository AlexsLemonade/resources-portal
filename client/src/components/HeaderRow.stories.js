import * as React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'
import { HeaderRow } from './HeaderRow'
import theme from '../theme'

storiesOf('HeaderRow', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="medium">
        <HeaderRow label="Basic Information" />
        <HeaderRow label="Culture" />
        <HeaderRow label="Quality" />
        <HeaderRow label="Additional Details" />
      </Box>
    </Grommet>
  )
})
