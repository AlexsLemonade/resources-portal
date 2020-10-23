import React from 'react'
import api from '../api'
import { useUser } from './useUser'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const useNotifications = () => {
  const { user, token, isLoggedIn } = useUser()
  const { notificationCount, setNotificationCount } = React.useContext(
    ResourcesPortalContext
  )

  const fetchNotifications = async () => {
    if (!isLoggedIn) return {}
    const notificationRequest = await api.users.notifications.list(
      user.id,
      token
    )
    if (notificationRequest.isOk && notificationRequest.response) {
      const retrievedNotifications = notificationRequest.response.results
      return retrievedNotifications
    }

    return {}
  }

  const fetchNewNotifications = async () => {
    if (!isLoggedIn) return {}

    const firstView = user.viewed_notifications_at === null

    // fetchs after the date saved in the user object
    const notificationRequest = firstView
      ? await api.users.notifications.list(user.id, token)
      : await api.users.notifications.filter(
          user.id,
          { created_at__gt: user.viewed_notifications_at },
          token
        )

    if (notificationRequest.isOk && notificationRequest.response) {
      const retrievedNotifications = notificationRequest.response.results
      setNotificationCount(retrievedNotifications.length)
      return retrievedNotifications
    }

    return {}
  }

  const getLastNotificationDate = (notifications) => {
    const notificationDates = notifications.map((notification) => {
      return new Date(notification.created_at)
    })
    const lastNotifDate = new Date(Math.max.apply(null, notificationDates))
    lastNotifDate.setSeconds(lastNotifDate.getSeconds() + 1)

    return lastNotifDate
  }

  return {
    fetchNotifications,
    fetchNewNotifications,
    notificationCount,
    setNotificationCount,
    getLastNotificationDate
  }
}
