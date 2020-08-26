import React from 'react'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'

const Notifications = () => {
  const notifications = []
  return (
    <DrillDownNav
      title="Notifications"
      secondaryLink="/account/notifications/settings"
      secondaryLinkLabel="settings"
    >
      {notifications.length === 0 && (
        <AccountEmptyPage paragraphs={['You have no notifications']} />
      )}
    </DrillDownNav>
  )
}

export default Notifications
