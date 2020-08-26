import React from 'react'
import { ResourcesPortalContext } from '../ResourcesPortalContext'

export const useAlertsQueue = (queue = 'main') => {
  const { alertsQueues, setAlertsQueues } = React.useContext(
    ResourcesPortalContext
  )

  const alertsQueue = alertsQueues[queue] || []

  const addAlert = (message, type = 'info') => {
    alertsQueue.push({
      time: Date.now(),
      message,
      type
    })
    setAlertsQueues({ ...alertsQueues, [queue]: alertsQueue })
  }

  const removeAlert = (alertToRemove) => {
    const newAlerts = alertsQueue.filter((a) => {
      return a.time !== alertToRemove.time
    })
    setAlertsQueues({ ...alertsQueues, [queue]: newAlerts })
  }

  const clearAlerts = () => {
    setAlertsQueues({ ...alertsQueues, [queue]: [] })
  }

  return {
    alerts: alertsQueue,
    addAlert,
    clearAlerts,
    removeAlert
  }
}

export default useAlertsQueue
