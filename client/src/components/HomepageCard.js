import React from 'react'
import { Box, Text, Image } from 'grommet'

export const HomepageCard = ({
  label,
  color = 'black',
  size = 'medium',
  imagePath,
  children,
  align = 'start',
  basis = '1/3'
}) => {
  return (
    <Box basis={basis} align={align}>
      <Image fill={false} src={imagePath} />
      <Text
        margin={{ top: 'medium', bottom: 'small' }}
        weight="bold"
        size={size}
        color={color}
      >
        {label}
      </Text>
      {children}
    </Box>
  )
}

export default HomepageCard
