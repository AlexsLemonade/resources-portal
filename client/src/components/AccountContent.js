import { Loader } from 'components/Loader'
import { EnterEmailModal } from 'components/modals/EnterEmailModal'
import { useLocalStorage } from 'hooks/useLocalStorage'
import { useSignIn } from 'hooks/useSignIn'
import { useUser } from 'hooks/useUser'
import { useRouter } from 'next/router'
import React from 'react'

export const AccountContent = ({ props }) => {
  const { noCode, orcid, access_token, refresh_token } = props
  const router = useRouter()
  const {
    needsEmail,
    orcidInfo,
    setOrcidInfo,
    setNeedsEmail,
    setEmail
  } = useSignIn()
  const [clientRedirectUrl, setClientRedirectUrl] = useLocalStorage(
    'clientRedirectUrl',
    ''
  )
  const { user } = useUser()

  // If the user navigates to /account manually, redirect them to /account/basic-information
  if (noCode && !needsEmail) {
    router.replace('/account/basic-information')
  }

  if (!orcidInfo && orcid && access_token && refresh_token) {
    setOrcidInfo({ orcid, access_token, refresh_token })
  }

  if (clientRedirectUrl && user && !needsEmail) {
    router.replace(clientRedirectUrl)
    setClientRedirectUrl()
  }

  if (needsEmail) {
    return <EnterEmailModal />
  }

  return <Loader />
}
