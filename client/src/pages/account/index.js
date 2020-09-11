import api from 'api'
import { Loader } from 'components/Loader'
import { EnterEmailModal } from 'components/modals/EnterEmailModal'
import { useSignIn } from 'hooks/useSignIn'
import { useRouter } from 'next/router'
import React from 'react'

export const Account = ({
  noCode,
  orcid,
  accessToken,
  refreshToken,
  error
}) => {
  const router = useRouter()
  const {
    needsEmail,
    orcidInfo,
    setOrcidInfo,
    setEmail,
    setNeedsEmail,
    setError
  } = useSignIn()

  console.log(error)

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
  console.log(query)
  // Revisit how to present errors thrown from this function
  if (!query.code) {
    return { noCode: true }
  }

  const orcidRequest = await api.user.getORCID(
    query.code,
    decodeURI(`https://${req.headers.host}${req.url}`)
  )
  if (orcidRequest.isOk) {
    const {
      orcid,
      access_token: accessToken,
      refresh_token: refreshToken
    } = orcidRequest.response

    return {
      orcid,
      accessToken,
      refreshToken
    }
  }
  return { error: orcidRequest }
}

export default Account
