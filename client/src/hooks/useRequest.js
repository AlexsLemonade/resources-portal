import React from 'react'
import { RequestContext } from 'contexts/RequestContext'

export default () => {
  const { request, refreshRequest, isFetched, isRequester } = React.useContext(
    RequestContext
  )
  return { request, refreshRequest, isFetched, isRequester }
}
