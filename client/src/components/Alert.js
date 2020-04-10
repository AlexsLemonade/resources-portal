import React from 'react'
import { Box, Button, Text } from 'grommet'
import styled from 'styled-components'

import Info from '../images/info-white.svg'
import Warning from '../images/warning-white.svg'
import Check from '../images/check-white.svg'
import Cross from '../images/cross-white.svg'

const types = {
  info: {
    Icon: Info,
    background: 'brand',
    multipleBackground: 'turteal-shade-20',
    color: 'white'
  },
  error: {
    Icon: Warning,
    background: 'error',
    multipleBackground: 'error-shade-20',
    color: 'white'
  },
  success: {
    Icon: Check,
    background: 'success',
    multipleBackground: 'success-shade-20',
    color: 'white'
  }
}

const CloseAlertButton = styled(Button)`
  text-align: right;
  padding-right: 16px;
`

export const Alert = ({
  type = 'info',
  message = '',
  height = '56px',
  onRemove
}) => {
  const { background, color, Icon } = types[type]

  return (
    <Box direction="row">
      <Box
        direction="row"
        width="full"
        height={height}
        background={background}
        justify="center"
        pad={{ left: height }}
      >
        <Box direction="row" align="center">
          {Icon && (
            <Box alignContents="center" margin={{ right: '8px' }}>
              <Icon />
            </Box>
          )}
          <Box>
            <Text color={color}>{message}</Text>
          </Box>
        </Box>
      </Box>
      <Box background={background} width={{ min: height }} height={height}>
        <CloseAlertButton fill plain icon={<Cross />} onClick={onRemove} />
      </Box>
    </Box>
  )
}

const MultipleAlerts = ({ alert, alerts, clearAlerts }) => {
  const { multipleBackground, color } = types[alert.type]
  return (
    <Box direction="row">
      <Box
        direction="row"
        width="full"
        height="40px"
        background={multipleBackground}
        justify="center"
      >
        <Box direction="row" align="center" pad={{ left: '80px' }}>
          <Text color={color}>{alerts.length} Alerts</Text>
        </Box>
      </Box>
      <Box
        direction="row"
        background={multipleBackground}
        width={{ min: '80px' }}
        pad={{ right: '16px' }}
        height="40px"
        justify="end"
      >
        <Button plain label="clear all" onClick={clearAlerts} />
      </Box>
    </Box>
  )
}

export const Alerts = ({ lifo = true, alerts, removeAlert, clearAlerts}) => {
  if (alerts.length === 0) return <></>

  const alert = lifo ? alerts[alerts.length - 1] : alerts[0]

  return (
    <>
      {alerts.length > 1 && (
        <MultipleAlerts
          alert={alert}
          alerts={alerts}
          clearAlerts={clearAlerts}
        />
      )}
      {alerts.length > 0 && (
        <Alert
          type={alert.type}
          message={alert.message}
          onRemove={() => {
            removeAlert(alert)
          }}
        />
      )}
    </>
  )
}

export const AlertsWithQueue = ({ lifo = true, queue }) => {
  const { alerts, clearAlerts, removeAlert } = queue
  return (
    <Alerts
      lifo={lifo}
      alerts={alerts}
      clearAlerts={clearAlerts}
      removeAlert={removeAlert}
    />
  )
}

export default Alert
