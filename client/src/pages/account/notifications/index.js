import React from 'react'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import { Loader } from 'components/Loader'
import { Notification } from 'components/Notification'
import { useNotifications } from 'hooks/useNotifications'
import { useUser } from 'hooks/useUser'
import api from 'api'

const Notifications = () => {
  const { notifications } = useNotifications()
  const [didUpdateNotifs, setdidUpdateNotifs] = React.useState(false)
  const { refreshUserData, user, token } = useUser()

  React.useEffect(() => {
    if (!didUpdateNotifs) {
      setdidUpdateNotifs(true)
      const updateNotifsViewed = async () => {
        const today = new Date()
        const response = await api.user
          .update(user.id, { viewed_notifications_at: today }, token)
          .then(refreshUserData)

        return response
      }
      updateNotifsViewed()
    }
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
