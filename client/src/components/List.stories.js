import * as React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'
import { List, ListItem } from './List'
import theme from '../theme'

storiesOf('List', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="xlarge" direction="row">
        <List pad="none">
          <ListItem
            title="Project Abstract"
            text="A brief description of your project."
          />
          <ListItem title="IRB Approval" text="A copy of your IRB approval." />
          <ListItem title="Shipping information">
            <List margin={{ top: '8px' }}>
              <ListItem
                marker="ring"
                title="Receiving Address"
                margin={{ bottom: '8px' }}
              />
              <ListItem
                marker="ring"
                title="Restrictions"
                text="Insitution only supports shipping via UPS"
              />
            </List>
          </ListItem>
        </List>
      </Box>
    </Grommet>
  )
})
