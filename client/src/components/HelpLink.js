import React from 'react'
import { Box } from 'grommet'
import Icon from 'components/Icon'
import Link from 'components/Link'
import styled from 'styled-components'

const HelpBox = styled(Box)`
  a {
    transform: translate(0, -25%);
  }
`

export default ({ href, children }) => {
  if (!href) return children
  return (
    <Box direction="row" align="baseline">
      {children}
      <HelpBox>
        <Link href={href}>
          <Icon name="Help" size="16px" />
        </Link>
      </HelpBox>
    </Box>
  )
}
