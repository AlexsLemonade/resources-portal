import React from 'react'
import { Box, Text } from 'grommet'
import PreviewIssue from 'components/PreviewIssue'
import useRequest from 'hooks/useRequest'

export default () => {
  const {
    request: { issues }
  } = useRequest()

  const descriptionOfIssue =
    issues && issues.length === 1
      ? 'Description of Issue'
      : 'Descriptions of Issues'

  return (
    <>
      <Box margin={{ vertical: 'medium' }}>
        <Text weight="bold">{descriptionOfIssue}</Text>
        {issues
          .filter((i) => i.status === 'OPEN')
          .map((i) => (
            <PreviewIssue key={i.id} issue={i} />
          ))}
      </Box>
    </>
  )
}
