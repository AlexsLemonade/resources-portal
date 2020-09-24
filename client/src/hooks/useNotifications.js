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
    // fetchs after the date saved in the user object
    const notificationRequest = await api.user.notifications.filter(
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

  const getUnreadNotifications = (notifications) => {
    // this takes the list of all notifications and determines which have not been seen yet
    if (!user || !notifications) {
      return false
    }

    if (!user.viewed_notifications_at) {
      return notifications
    }

    const unreadNotifications = notifications.filter((notification) => {
      const notifDate = new Date(notification.created_at)
      const userSeenDate = new Date(user.viewed_notifications_at)
      return notifDate > userSeenDate
    })

    setNotificationCount(unreadNotifications.length)
    return unreadNotifications
  }

  const getLastNotificationDate = (notifications) => {
    const notificationDates = notifications.map((notification) => {
      return new Date(notification.created_at)
    })
    return new Date(Math.max.apply(null, notificationDates))
  }

  return {
    fetchNotifications,
    fetchNewNotifications,
    notificationCount,
    setNotificationCount,
    getUnreadNotifications,
    getLastNotificationDate
  }
}
