import React from 'react'
import { Grommet, Box } from 'grommet'
import { storiesOf } from '@storybook/react'
import { SideNav } from './SideNav'
import theme from '../theme'

storiesOf('SideNav', module).add('default', () => {
  const links = [
    {
      text: 'Basic Information',
      href: '/account/basic-information',
      notifications: 0
    },
    {
      text: 'Manage Resources',
      href: '/account/manage-resources',
      notifications: 0
    },
    {
      text: 'Requests',
      href: '/account/requests',
      notifications: 0
    },
    {
      text: 'Teams',
      href: '/account/teams',
      notifications: 0
    },
    {
      text: 'Notifications',
      href: '/account/notifications',
      notifications: 4
    }
  ]

  const [active, setActive] = React.useState(links[0])

  return (
    <Grommet theme={theme}>
      <Box width="medium" pad="small" direction="row">
        <Box width="200px">
          <SideNav
            active={active}
            links={links}
            onLinkClick={(link) => {
              setActive(link)
            }}
          />
        </Box>
        <Box height="full" pad="medium">
          {active.text}
        </Box>
      </Box>
    </Grommet>
  )
})
