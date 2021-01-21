import React from 'react'
import { Paragraph, Text } from 'grommet'
import { getReadable } from 'helpers/readableNames'

export default ({ attribute, optional = false }) => {
  return (
    <Paragraph>
      {getReadable(attribute)}
      {optional && (
        <Text color="black-tint-60" italic>
          {' '}
          (Optional)
        </Text>
      )}
    </Paragraph>
  )
}
