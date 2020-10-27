import React from 'react'
import { Box, Paragraph } from 'grommet'
import Icon from 'components/Icon'

export const InfoCard = ({
  elevation = 'medium',
  label = '',
  type = 'Info',
  iconColor,
  children
}) => {
  const color = iconColor || (type && type.toLowerCase())
  return (
    <Box
      elevation={elevation}
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
