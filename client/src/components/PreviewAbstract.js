import React from 'react'
import { Box, Text, Paragraph } from 'grommet'

export default ({ abstract }) => {
  const paragraphs = abstract.split('\n')
  return (
    <Box margin={{ bottom: 'medium' }}>
      <Text weight="bold" margin={{ bottom: 'small' }}>
        Abstract
      </Text>
      {paragraphs.map((p) => (
        <Paragraph key={p}>{p}</Paragraph>
      ))}
    </Box>
  )
}
