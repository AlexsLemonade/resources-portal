import React from 'react'
import { useRouter } from 'next/router'
import { Loader } from 'components/Loader'

// This page currently has no content.
// Show loader then redirect to basic info

export default () => {
  const router = useRouter()

  React.useEffect(() => {
    router.replace('/account/basic-information')
  })

  return <Loader />
}
