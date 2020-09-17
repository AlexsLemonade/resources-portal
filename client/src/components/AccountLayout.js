import React from 'react'
import { Box, Heading, Main } from 'grommet'
import { useRouter } from 'next/router'
import { useNotifications } from 'hooks/useNotifications'
import { useIsClient } from '../hooks/useIsClient'
import { SideNav } from './SideNav'
import Header from './Header'

const notificationsDict = {
  basicInfo: [''],
  manageResources: ['MATERIAL_ADDED', 'MATERIAL_ARCHIVED', 'MATERIAL_DELETED'],
  requests: [
    'MATERIAL_REQUEST_SHARER_ASSIGNED_NEW',
    'MATERIAL_REQUEST_SHARER_RECEIVED',
    'MATERIAL_REQUEST_SHARER_ASSIGNED',
    'MATERIAL_REQUEST_SHARER_ASSIGNMENT',
    'MATERIAL_REQUEST_SHARER_APPROVED',
    'MATERIAL_REQUEST_SHARER_REJECTED',
    'MATERIAL_REQUEST_SHARER_CANCELLED',
    'MATERIAL_REQUEST_SHARER_RECEIVED_MTA',
    'MATERIAL_REQUEST_SHARER_RECEIVED_INFO',
    'MATERIAL_REQUEST_SHARER_EXECUTED_MTA',
    'MATERIAL_REQUEST_SHARER_IN_FULFILLMENT',
    'MATERIAL_REQUEST_SHARER_FULFILLED',
    'MATERIAL_REQUEST_SHARER_VERIFIED',
    'MATERIAL_REQUEST_ISSUE_SHARER_REPORTED',
    'MATERIAL_REQUEST_REQUESTER_ACCEPTED',
    'MATERIAL_REQUEST_REQUESTER_IN_FULFILLMENT',
    'MATERIAL_REQUEST_REQUESTER_EXECUTED_MTA',
    'MATERIAL_REQUEST_REQUESTER_FULFILLED',
    'MATERIAL_REQUEST_REQUESTER_REJECTED',
    'MATERIAL_REQUEST_REQUESTER_ESCALATED'
  ],
  teams: [
    'ORGANIZATION_NEW_MEMBER',
    'ORGANIZATION_BECAME_OWNER',
    'ORGANIZATION_NEW_OWNER',
    'ORGANIZATION_MEMBER_LEFT',
    'ORGANIZATION_NEW_GRANT',
    'ORGANIZATION_INVITE'
  ]
}

const getNotificationsForType = (notifications, type) => {
  if (!notifications) {
    return {}
  }
  const notifsForType = notifications.filter((notification) => {
    return notificationsDict[type].includes(notification.notification_type)
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
