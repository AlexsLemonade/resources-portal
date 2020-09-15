import React from 'react'
import { Box, Paragraph } from 'grommet'
import Icon from 'components/Icon'

export const InfoCard = ({ label = '', type = 'Info', children }) => {
  const color = type && type.toLowerCase()
  return (
    <Box
      elevation="medium"
      round="xsmall"
      direction="row"
      align="center"
      gap="medium"
      pad="medium"
    >
      {type && <Icon name={type} color={color} />}
      <Box>
        {label && <Paragraph>{label}</Paragraph>}
        {children}
      </Box>
    </Box>
  )
}

export default InfoCard
