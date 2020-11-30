import React from 'react'
import { Box } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import { Loader } from 'components/Loader'
import { Notification } from 'components/Notification'
import { useNotifications } from 'hooks/useNotifications'
import { useUser } from 'hooks/useUser'
import api from 'api'

const Notifications = () => {
  const { refreshUser, user, token } = useUser()
  const { getLastNotificationDate, fetchNotifications } = useNotifications()
  const [didUpdateNotifs, setdidUpdateNotifs] = React.useState(false)
  const [notifications, setNotifications] = React.useState([])

  React.useEffect(() => {
    const updateNotifsViewed = async () => {
      const notifs = await fetchNotifications()
      setdidUpdateNotifs(true)
      setNotifications(notifs)
      await api.users.update(
        user.id,
        { viewed_notifications_at: getLastNotificationDate(notifs) },
        token
      )
      refreshUser()
    }

    if (!didUpdateNotifs) updateNotifsViewed()
  })

  if (!notifications) return <Loader />

  return (
    <DrillDownNav
      title="Notifications"
      secondaryLink="/account/notifications/settings"
      secondaryLinkLabel="settings"
    >
      {notifications.length === 0 && (
        <AccountEmptyPage paragraphs={['You have no notifications']} />
      )}
      {notifications.length !== 0 &&
        notifications.map((notification) => {
          return (
            <Box
              key={notification.id}
              elevation="medium"
              margin={{ bottom: 'large' }}
              round="xsmall"
            >
              <Notification notification={notification} />
            </Box>
          )
        })}
    </DrillDownNav>
  )
}

export default Notifications
