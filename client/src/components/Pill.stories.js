import * as React from 'react'
import { Grommet, Box, Paragraph } from 'grommet'
import { storiesOf } from '@storybook/react'
import { Pill, NumberPill } from './Pill'
import theme from '../theme'

storiesOf('Pill', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="medium">
        <Pill label="badge-label" />
      </Box>
      <Box pad="medium">
        <Pill label="Another Example" />
      </Box>
      <Box pad="medium">
        <Pill background="brand" color="white" label="Brand Example" />
      </Box>
    </Grommet>
  )
})

storiesOf('Pill', module).add('NumberPill', () => {
  const numbers = [1, 10, 100, 1000, 1500, 3500, 10000, 25000, 255000, 15000000]
  return (
    <Grommet theme={theme}>
      {numbers.map((number) => (
        <Box pad="medium" key={number}>
          <Box>
            <Paragraph>{number}</Paragraph>
            <NumberPill value={number} />
          </Box>
        </Box>
      ))}
    </Grommet>
  )
})
