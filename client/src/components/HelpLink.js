import React from 'react'
import { Box, Text } from 'grommet'
import Icon from 'components/Icon'
import Link from 'components/Link'
import styled from 'styled-components'

const HelpBox = styled(Box)`
  a {
    margin-left: 4px;
    transform: translate(0, -25%);
  }
`

export default ({ path, knowledgebase = true, label, children }) => {
  if (!path) return children || label
  const href = knowledgebase
    ? `https://help.resources.alexslemonade.org/knowlege/${path}`
    : path
  return (
    <Box direction="row" align="baseline">
      {label && <Text>{label}</Text>}
      {children}
      <HelpBox>
        <Link href={href}>
          <Icon name="Help" size="16px" />
        </Link>
      </HelpBox>
    </Box>
  )
}
