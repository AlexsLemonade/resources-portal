import React from 'react'
import { Box, Paragraph } from 'grommet'

export const HeaderRow = ({ label }) => {
  return (
    <Box direction="row" align="center">
      <Paragraph margin={{ right: '4px' }} weight="600" color="brand">
        {label}
      </Paragraph>
      <Box
        background="brand"
        margin={{ top: '4px' }}
        flex="grow"
        height="2px"
      />
    </Box>
  )
}

export default HeaderRow
