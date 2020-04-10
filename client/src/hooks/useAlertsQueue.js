import React from 'react'

export const AlertsContext = React.createContext({ alerts: {} })

export const useAlertsQueue = (queue = 'main') => {
  const context = React.useContext(AlertsContext)

  const [alerts, setAlerts] = React.useState(context.alerts)

  if (!alerts[queue]) alerts[queue] = []

  const addAlert = (message, type = 'info') => {
    context.alerts[queue].push({
      time: Date.now(),
      message,
      type
    })
    setAlerts({ ...context.alerts })
  }

  const removeAlert = (alertToRemove) => {
    const newAlerts = context.alerts[queue].filter((a) => {
      return a.time !== alertToRemove.time
    })
    context.alerts[queue] = newAlerts
    setAlerts({ ...context.alerts })
  }

  const clearAlerts = () => {
    context.alerts[queue] = []
    setAlerts({ ...context.alerts })
  }

  return {
    alerts: context.alerts[queue],
    addAlert,
    clearAlerts,
    removeAlert
  }
}

export default useAlertsQueue
