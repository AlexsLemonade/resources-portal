import React from 'react'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import { Loader } from 'components/Loader'
import { Notification } from 'components/Notification'
import { useNotifications } from 'hooks/useNotifications'

const Notifications = () => {
  const { notifications } = useNotifications()

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
