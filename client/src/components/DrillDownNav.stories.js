import React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'
import { DrillDownNav } from './DrillDownNav'
import theme from '../theme'

// fake next/link so this works in storybook
const FakeNextLink = ({ children }) => {
  return <>{children}</>
}

storiesOf('DrillDownNav', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box width="large" pad="small">
        <DrillDownNav title="Top Level">This is the top</DrillDownNav>
      </Box>
    </Grommet>
  )
})

// DO NOT set `linker`
// ONLY set `linkBack`
// This is just to make it not throw an error outside of a next/router context
storiesOf('DrillDownNav', module).add('With linkBack', () => {
  return (
    <Grommet theme={theme}>
      <Box width="large" pad="small">
        <DrillDownNav
          title="Nested Level"
          linkBack="/?path=/story/drilldownnav--default"
          linker={FakeNextLink}
        >
          This is nested with a link
        </DrillDownNav>
      </Box>
    </Grommet>
  )
})
