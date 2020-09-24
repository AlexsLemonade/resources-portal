import React from 'react'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import { Loader } from 'components/Loader'
import { Notification } from 'components/Notification'
import { useNotifications } from 'hooks/useNotifications'
import { useUser } from 'hooks/useUser'
import api from 'api'

const Notifications = () => {
  const { refreshUserData, user, token } = useUser()
  const { getLastNotificationDate, fetchNotifications } = useNotifications()
  const [didUpdateNotifs, setdidUpdateNotifs] = React.useState(false)
  const [notifications, setNotifications] = React.useState([])

  React.useEffect(() => {
    const updateNotifsViewed = async () => {
      await fetchNotifications().then((notifs) => {
        setNotifications(notifs)
      })
      setdidUpdateNotifs(true)
      await api.user.update(
        user.id,
        { viewed_notifications_at: getLastNotificationDate(notifications) },
        token
      )
      refreshUserData()
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
            <Notification notification={notification} key={notification.id} />
          )
        })}
    </DrillDownNav>
  )
}

export default Notifications
