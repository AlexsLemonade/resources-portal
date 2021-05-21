import * as React from 'react'
import { Grommet, Box, Text } from 'grommet'
import { storiesOf } from '@storybook/react'
import Icon, { SVGs } from './Icon'

import theme from '../theme'

storiesOf('Icon', module).add('default', () => {
  const names = Object.keys(SVGs)
  const colors = ['plain', ...Object.keys(theme.global.colors)]

  return (
    <Grommet theme={theme}>
      {names.map((name) => (
        <Box key={name}>
          <Text>{name}</Text>
          <Box key={name} pad="medium" gap="medium" direction="row">
            {colors.map((color) => (
              <Icon
                key={`${name}-${color}`}
                name={name}
                color={color}
                size="large"
              />
            ))}
          </Box>
        </Box>
      ))}
    </Grommet>
  )
})
