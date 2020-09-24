import React from 'react'
import { Button } from 'grommet'
import Link from 'next/link'
import { CreateAccountLoginButton } from 'components/CreateAccountLoginButton'
import { useUser } from 'hooks/useUser'

export const RequestButton = ({ resource }) => {
  const { isLoggedIn } = useUser()

  if (isLoggedIn) {
    return (
      <Link
        href="/resources/[id]/request"
        as={`/resources/${resource.id}/request`}
      >
        <Button label="Request" primary />
      </Link>
    )
  }

  return <CreateAccountLoginButton title="Sign in to Request" plainButton />
}

export default RequestButton
