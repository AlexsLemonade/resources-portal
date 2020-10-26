import React from 'react'
import { DrillDownNav } from 'components/DrillDownNav'
import { useUser } from 'hooks/useUser'
import RequesterManageRequestForm from 'components/resources/RequesterManageRequestForm'
import SharerManageRequestForm from 'components/resources/SharerManageRequestForm'
import api from 'api'
import { Loader } from 'components/Loader'

export const Request = ({ id }) => {
  const { user, token } = useUser()
  const [request, setRequest] = React.useState()

  React.useEffect(() => {
    const fetchResourceRequest = async () => {
      const requestRequest = await api.requests.get(id, token)
      if (requestRequest.isOk) setRequest(requestRequest.response)
    }
    if (!request) fetchResourceRequest()
  })

  if (!request) return <Loader />

  const isRequester = request.requester.id === user.id

  return (
    <DrillDownNav title="Request Details" linkBack="/account/requests">
      {isRequester && <RequesterManageRequestForm request={request} />}
      {!isRequester && <SharerManageRequestForm request={request} />}
    </DrillDownNav>
  )
}

Request.getInitialProps = ({ query: { id } }) => {
  return { id }
}

export default Request
