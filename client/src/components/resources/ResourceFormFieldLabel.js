import React from 'react'
import { Paragraph, Text } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import { getIsOptional } from '.'

export default ({ attribute }) => {
  const isOptional = getIsOptional(attribute)
  return (
    <Paragraph>
      {getReadable(attribute)}
      {isOptional && (
        <Text color="black-tint-60" italic>
          {' '}
          (Optional)
        </Text>
      )}
    </Paragraph>
  )
}
