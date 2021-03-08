import React from 'react'
import Link from 'next/link'
import { Anchor } from 'grommet'

export default ({ href, label, icon, as, children = '' }) => {
  return (
    <Link href={href} prefetch>
      <Anchor href={href} label={label} icon={icon} as={as}>
        {children}
      </Anchor>
    </Link>
  )
}
