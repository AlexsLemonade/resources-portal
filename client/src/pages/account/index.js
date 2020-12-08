import React from 'react'
import { Loader } from 'components/Loader'
import { EnterEmailModal } from 'components/modals/EnterEmailModal'
import { useSignIn } from 'hooks/useSignIn'
import getRedirectQueryParam from 'helpers/getRedirectQueryParam'
// This page should only:
// 1) finish sign up by asking for email
// 2) let the hook redirect the user to where they left off

export const Account = ({ code, clientPath }) => {
  const { needsEmail, setEmail, setNeedsEmail, setError } = useSignIn(
    code,
    getRedirectQueryParam(clientPath)
  )

  if (needsEmail) {
    return (
      <EnterEmailModal
        onSubmit={(email) => {
          setError()
          setEmail(email)
          setNeedsEmail(false)
        }}
      />
    )
  }

  return <Loader />
}

Account.getInitialProps = async ({ req, query }) => {
  return {
    code: query.code,
    clientPath: req ? req.url : ''
  }
}

export default Account
