import React from 'react'
import RequesterManageRequestForm from 'components/resources/RequesterManageRequestForm'
import SharerManageRequestForm from 'components/resources/SharerManageRequestForm'
import { Loader } from 'components/Loader'
import useRequest from 'hooks/useRequest'

export default () => {
  const { isFetched, isRequester } = useRequest()
  if (!isFetched) return <Loader />
  return isRequester ? (
    <RequesterManageRequestForm />
  ) : (
    <SharerManageRequestForm />
  )
}
