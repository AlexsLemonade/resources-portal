import React from 'react'
import { Box, Heading, Main } from 'grommet'
import { useRouter } from 'next/router'
import { useNotifications } from 'hooks/useNotifications'
import { SideNav } from './SideNav'
import Header from './Header'
import { Footer } from './Footer'

export default ({ children }) => {
  const { notificationCount } = useNotifications()
  const router = useRouter()

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
      notifications: notificationCount
    }
  ]

  const [active, setActive] = React.useState(
    links.find((link) => router.pathname.startsWith(link.href))
  )

  const onLinkClick = (link) => {
    router.push(link.href)
    setActive(link)
  }

  return (
    <Box height={{ min: '100vh' }}>
      <Box margin={{ bottom: 'xlarge' }}>
        <Header />
      </Box>
      <Main
        width="xxlarge"
        alignSelf="center"
        overflow="visible"
        margin={{ bottom: 'large' }}
      >
        <Heading serif level={4} margin={{ vertical: 'small' }}>
          My Account
        </Heading>
        <Box
          direction="row"
          gap="xlarge"
          border={{ side: 'top', color: 'black-tint-95', size: 'small' }}
          pad={{ top: 'large' }}
        >
          <Box width="212px">
            <SideNav links={links} active={active} onLinkClick={onLinkClick} />
          </Box>
          <Box align="start">
            <Box width="large">{children}</Box>
          </Box>
        </Box>
      </Main>
      <Footer />
    </Box>
  )
}
