import React from 'react'
import api from '../api'
import { useUser } from './useUser'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const useNotifications = () => {
  const { user, token } = useUser()
  const { notificationCount, setNotificationCount } = React.useContext(
    ResourcesPortalContext
  )

  const fetchNotifications = async () => {
    const notificationRequest = await api.user.notifications.list(
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
    let notificationRequest = {}

    // fetchs after the date saved in the user object
    if (user.viewed_notifications_at === null) {
      notificationRequest = await api.user.notifications.list(user.id, token)
    } else {
      notificationRequest = await api.user.notifications.filter(
        user.id,
        { created_at__gt: user.viewed_notifications_at },
        token
      )
    }
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
