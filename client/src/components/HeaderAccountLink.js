import { Anchor } from 'grommet'
import Link from 'next/link'
import * as React from 'react'
import { useUser } from '../hooks/useUser'
import { LoginButton } from './LoginButton'
import { SignInModal } from './SignInModal'

export const HeaderAccountLink = () => {
  const { isLoggedIn } = useUser()
  const [showing, setShowing] = React.useState(false)

  if (!isLoggedIn) {
    return (
      <>
        <LoginButton onClick={() => setShowing(true)} />
        <SignInModal showing={showing} setShowing={setShowing} />
      </>
    )
  }

  return (
    <Link href="/account">
      <Anchor color="white" href="#" label="My Account" />
    </Link>
  )
}

export default HeaderAccountLink
