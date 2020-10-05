import React from 'react'
import { Box, Text } from 'grommet'
import { Blank } from 'grommet-icons'

export const NumberMarker = ({ number }) => {
  return (
    <Box
      border={{ color: 'brand' }}
      round="50%"
      width="16px"
      height="16px"
      align="center"
      justify="center"
      pad="10px"
    >
      <Text color="brand" size="small">
        {number}
      </Text>
    </Box>
  )
}

const Circle = ({ color, size }) => (
  <Blank size={size} color={color}>
    <circle cx={12} cy={12} r={12} fill="#000" />
  </Blank>
)

const Ring = ({ color, size }) => (
  <Blank size={size} color={color}>
    <circle cx={12} cy={12} r={10} stroke="#000" strokeWidth="4" />
  </Blank>
)

const listMarkers = {
  circle: <Circle size="8px" color="brand" />,
  ring: <Ring size="9px" color="brand" />
}

export const List = ({
  children,
  type = 'ul',
  pad = 'none',
  margin = 'none'
}) => {
  return (
    <Box as={type} pad={pad} margin={margin}>
      {children}
    </Box>
  )
}

const getListMarker = (stringOrComponent) => {
  if (typeof stringOrComponent === 'string') {
    const Marker = listMarkers[stringOrComponent]
    return Marker || <></>
  }
  return stringOrComponent
}

export const ListItem = ({
  children,
  marker = 'circle',
  title,
  text,
  markerMargin = {
    top: '8px',
    right: '8px'
  },
  margin = {
    bottom: '24px'
  }
}) => {
  const listMarker = getListMarker(marker)
  const align =
    markerMargin === 'none' || markerMargin.top === 'none' ? 'center' : 'start'
  return (
    <Box as="li" direction="row" margin={margin} align={align}>
      <Box margin={markerMargin}>{listMarker}</Box>
      <Box flex="grow">
        {title && <Text weight="bold">{title}</Text>}
        {text && <Text>{text}</Text>}
        {children}
      </Box>
    </Box>
  )
}
