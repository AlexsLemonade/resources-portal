import React from 'react'
import { Loader } from 'components/Loader'
import { EnterEmailModal } from 'components/modals/EnterEmailModal'
import { useSignIn } from 'hooks/useSignIn'

// This page should only:
// 1) finish sign up by asking for email
// 2) let the hook redirect the user to where they left off

export const Account = ({ code, originUrl }) => {
  const { needsEmail, setEmail, setNeedsEmail, setError } = useSignIn(
    code,
    originUrl
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
  // Revisit how to present errors thrown from this function
  const originUrl = decodeURI(`${process.env.CLIENT_HOST}${req ? req.url : ''}`)

  return {
    code: query.code,
    originUrl
  }
}

export default Account
