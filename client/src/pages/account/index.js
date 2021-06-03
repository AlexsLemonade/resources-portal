import React from 'react'
import { useRouter } from 'next/router'
import { Loader } from 'components/Loader'
import { ResourcesPortalContext } from 'ResourcesPortalContext'

// This page currently has no content.
// Show loader then redirect to basic info

export default () => {
  const router = useRouter()
  const { skipAccountRedirectRef } = React.useContext(ResourcesPortalContext)
  React.useEffect(() => {
    if (!skipAccountRedirectRef.current) {
      router.replace('/account/basic-information')
    }
    skipAccountRedirectRef.current = false
  }, [])

  return <Loader />
}
