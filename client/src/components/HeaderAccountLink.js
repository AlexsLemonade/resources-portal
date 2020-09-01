import { Anchor } from 'grommet'
import Link from 'next/link'
import * as React from 'react'
import { useUser } from '../hooks/useUser'
import { CreateOrLoginButton } from './CreateOrLogin'

export const HeaderAccountLink = () => {
  const { isLoggedIn } = useUser()

  if (!isLoggedIn) {
    return <CreateOrLoginButton title="Create a BioResources Portal Account" />
  }

  return (
    <Link href="/account">
      <Anchor color="white" href="#" label="My Account" />
    </Link>
  )
}

export default HeaderAccountLink
