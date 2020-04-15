import * as React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'

import SearchInput from './SearchInput'
import theme from '../theme'

storiesOf('SearchInput', module).add('default', () => {
  const [query, setQuery] = React.useState('')
  const onChange = (e) => setQuery(e.target.value)
  return (
    <Grommet theme={theme}>
      <Box pad="xlarge">
        <SearchInput query={query} onChange={onChange} />
      </Box>
    </Grommet>
  )
})
