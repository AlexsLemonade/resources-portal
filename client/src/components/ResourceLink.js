import React from 'react'
import Link from 'next/link'
import { Anchor } from 'grommet'
import styled from 'styled-components'

const AnchorBold = styled(Anchor)`
  font-weight: 600;
`

export default ({ resource }) => {
  const href = `/resources/${resource.id}`
  return (
    <Link href={href}>
      <AnchorBold weight="600" href={href} label={resource.title} />
    </Link>
  )
}
