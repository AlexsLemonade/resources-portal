import React from 'react'
import api from '../api'
import { useUser } from './useUser'

export const useNotifications = () => {
  const { user, token } = useUser()
  const [notifications, setNotifications] = React.useState()

  React.useEffect(() => {
    const fetchNotifications = async () => {
      const notificationRequest = await api.user.notifications.list(
        user.id,
        token
      )
      if (notificationRequest.isOk && notificationRequest.response) {
        const retrievedNotifications = notificationRequest.response.results
        setNotifications(retrievedNotifications)
      }
    }

    if (user && !notifications) fetchNotifications()
  }, [])

  const getUnreadNotifications = () => {
    if (!user || !notifications) {
      return {}
    }

    if (!user.viewed_notifications_at) {
      return notifications
    }

    const unreadNotifications = notifications.filter((notification) => {
      const notifDate = new Date(notification.created_at)
      const userSeenDate = new Date(user.viewed_notifications_at)
      return notifDate > userSeenDate
    })

    return unreadNotifications
  }

  return {
    notifications,
    getUnreadNotifications
  }
}
