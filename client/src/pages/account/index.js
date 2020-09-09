import api from 'api'
import { Loader } from 'components/Loader'
import { EnterEmailModal } from 'components/modals/EnterEmailModal'
import { useSignIn } from 'hooks/useSignIn'
import { useRouter } from 'next/router'
import React from 'react'

export const Account = ({ noCode, orcid, accessToken, refreshToken }) => {
  const router = useRouter()
  const {
    needsEmail,
    orcidInfo,
    setOrcidInfo,
    setEmail,
    setNeedsEmail,
    setError
  } = useSignIn()

  // If the user navigates to /account manually, redirect them to /account/basic-information
  if (noCode && !needsEmail) {
    router.replace('/account/basic-information')
  }

  React.useEffect(() => {
    if (!orcidInfo && orcid && accessToken && refreshToken) {
      setOrcidInfo({ orcid, accessToken, refreshToken })
    }
  })

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
  if (!query.code) {
    return { noCode: true }
  }

  const response = await api.user.getORCID(
    query.code,
    decodeURI(`http://${req.headers.host}${req.url}`)
  )

  const initialProps = {}

  initialProps.orcid = response.response.orcid
  initialProps.accessToken = response.response.access_token
  initialProps.refreshToken = response.response.refresh_token

  return initialProps
}

export default Account
