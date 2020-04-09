import React from 'react'
import { Box, Button, Text } from 'grommet'
import Info from '../images/info.svg'
import Warning from '../images/warning.svg'
import Check from '../images/check.svg'
import Cross from '../images/cross.svg'

export const useAlertContext = () => {
  const [alerts, setAlerts] = React.useState([])
  const addAlert = (alert) => {
    setAlerts([...alerts, alert])
  }
  const removeAlert = () => {
    const newAlerts = [...alerts]
    newAlerts.shift()
    setAlerts(newAlerts)
  }
  const clearAlerts = () => {
    setAlerts([])
  }

  return React.useContext({
    alerts: [],
    addAlert,
    removeAlert,
    clearAlerts
  })
}

const alertTypes = {
  info: {
    background: 'brand',
    color: 'white'
  },
  error: {
    background: 'error',
    color: 'white'
  },
  success: {
    background: 'success',
    color: 'white'
  }
}

export const Alert = ({ type = 'info', message = '' }) => {
  const { background, color } = alertTypes[type]

  return (
    <Box anchor="right" direction="row">
      <Box
        direction="row"
        width="full"
        height="40px"
        background={background}
        justify="center"
      >
        <Box direction="row" align="center">
          <Box align="center">
            {type === 'info' && <Info />}
            {type === 'success' && <Check />}
            {type === 'error' && <Warning />}
          </Box>
          <Box>
            <Text color={color}>{message}</Text>
          </Box>
        </Box>
      </Box>
      <Box background={background} width="40px" height="40px">
        <Button fill justify="center" plain icon={<Cross />} />
      </Box>
    </Box>
  )
}

export const AlertZone = () => {
  const { alerts } = React.useContext()
  return (
    <>
      {alerts.lenth > 1 && 'MORE THAN ONE'}
      {alerts.length >= 1 && (
        <Alert type={alerts[0].type} message={alert[0].message} />
      )}
    </>
  )
}

// Alert
// AlertContext
//
// Takes a message and type/role and presents the alert
//
// all alerts are closeable
//
// may be possible to be outside of header
//
// they do not time out so forever until you click
// they go away after you navigate away
//
// stack virtually and preset 1 at a time
//
// (close all button?)
//
// show how many exist with number
//
// 40 tall
// including 8px vert padding
// for how many and clear all space
