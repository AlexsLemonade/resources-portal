import React from 'react'
import Link from 'next/link'
import { Anchor } from 'grommet'
import isExternalPath from 'helpers/isExternalPath'

export default ({ href, label, icon, as, children = '', color = 'brand' }) => {
  return isExternalPath(href) ? (
    <Anchor
      target="_blank"
      color={color}
      href={href}
      label={label}
      icon={icon}
      as={as}
    >
      {children}
    </Anchor>
  ) : (
    <Link href={href} prefetch>
      <Anchor color={color} href={href} label={label} icon={icon} as={as}>
        {children}
      </Anchor>
    </Link>
  )
}
