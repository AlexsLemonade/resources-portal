import React from 'react'
import { Anchor, Markdown } from 'grommet'
import getHelperText from 'helpers/getHelperText'
import styled from 'styled-components'

const StyledSpan = styled.span`
  font-style: italic;
  font-size: 12px;
  color: #666666;
`

// Override default anchor behavior to open link in new tab
const ExternalAnchor = (props) => {
  /* eslint-disable-next-line */
  return <Anchor {...props} target="_blank"/>
}

export default ({ attribute }) => {
  const helperText = getHelperText(attribute)
  if (!helperText) return false
  return (
    <Markdown components={{ span: StyledSpan, a: ExternalAnchor }}>
      {helperText}
    </Markdown>
  )
}
