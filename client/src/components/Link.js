import React from 'react'
import Link from 'next/link'
import { Anchor } from 'grommet'

export default ({ href, label, children = '' }) => {
  return (
    <Link href={href} prefetch>
      <Anchor href={href} label={label}>
        {children}
      </Anchor>
    </Link>
  )
}
