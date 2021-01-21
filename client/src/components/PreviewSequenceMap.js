import React from 'react'
import { Box, Image, Text } from 'grommet'

export default ({ map }) => {
  return (
    <Box key={map.filename} width="100px" height="120px">
      <Image fit="cover" src={map.download_url} />
      <Text truncate>{map.filename}</Text>
    </Box>
  )
}
