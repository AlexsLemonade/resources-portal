import * as React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'

import SearchInput from './SearchInput'
import theme from '../theme'

storiesOf('SearchInput', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="xlarge">
        <SearchInput />
      </Box>
    </Grommet>
  )
})
