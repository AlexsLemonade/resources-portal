import * as React from 'react'
import { Grommet, Box, Text } from 'grommet'
import { storiesOf } from '@storybook/react'
import { Popover } from './Popover'
import theme from '../theme'

storiesOf('Popover', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="xlarge" direction="row">
        <Text weight="bold">
          {'Requirements: '}
          <Popover label="Shipping Information">
            <Box width="auto">
              <Text weight="bold">Require:</Text>
              <Text margin={{ left: '4px' }}>Shipping Address</Text>
              <Text margin={{ left: '4px', bottom: '4px' }}>
                Shipping Service Code
              </Text>
              <Text weight="bold">Restrictions</Text>
              <Text margin={{ left: '4px' }}>
                Insitution only supports shipping via UPS
              </Text>
            </Box>
          </Popover>
        </Text>
      </Box>
    </Grommet>
  )
})
