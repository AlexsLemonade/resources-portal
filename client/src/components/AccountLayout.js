import React from 'react'
import { Box, Heading, Main } from 'grommet'
import { useRouter } from 'next/router'
import { useNotifications } from 'hooks/useNotifications'
import { NOTIFICATION_TYPES } from 'helpers/notificationTypes'
import { useIsClient } from '../hooks/useIsClient'
import { SideNav } from './SideNav'
import Header from './Header'

const getNotificationsForType = (notifications, type) => {
  if (!notifications) {
    return {}
  }
  const notifsForType = notifications.filter((notification) => {
    return NOTIFICATION_TYPES[type].includes(notification.notification_type)
  })

  return notifsForType
}

export const AccountLayout = ({ children }) => {
  const isClient = useIsClient()
  const { getUnreadNotifications } = useNotifications()
  const router = useRouter()

  let unreadNotifs = []
  unreadNotifs = getUnreadNotifications()
  const links = [
    {
      text: 'Basic Information',
      href: '/account/basic-information',
      notifications: getNotificationsForType(unreadNotifs, 'basicInfo').length
    },
    {
      text: 'Manage Resources',
      href: '/account/manage-resources',
      notifications: getNotificationsForType(unreadNotifs, 'manageResources')
        .length
    },
    {
      text: 'Requests',
      href: '/account/requests',
      notifications: getNotificationsForType(unreadNotifs, 'requests').length
    },
    {
      text: 'Teams',
      href: '/account/teams',
      notifications: getNotificationsForType(unreadNotifs, 'teams').length
    },
    {
      text: 'Notifications',
      href: '/account/notifications',
      notifications: unreadNotifs.length
    }
  ]

  const [active, setActive] = React.useState(
    links.find((link) => link.href === router.route)
  )

  const onLinkClick = (link) => {
    router.push(link.href)
    setActive(link)
  }

  return isClient(
    '',
    <Box height={{ min: '100vh' }}>
      <Box margin={{ bottom: 'xlarge' }}>
        <Header />
      </Box>
      <Main width="xxlarge" alignSelf="center" overflow="visible">
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
    </Box>
  )
}

export default AccountLayout
