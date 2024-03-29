import React from 'react'
import api from 'api'
import { useUser } from 'hooks/useUser'

export const RequestContext = React.createContext({})

export const RequestContextProvider = ({ requestId, children }) => {
  const { user, token } = useUser()
  const fetchedRef = React.useRef(false)
  const [request, setRequest] = React.useState({})

  // refreshRequest
  const refreshRequest = async () => {
    const requestRequest = await api.requests.get(requestId, token)
    if (requestRequest.isOk) {
      fetchedRef.current = true
      setRequest(requestRequest.response)
      // scroll to top of page when we refresh the request
      window.scrollTo({
        top: 0
      })
    } else {
      fetchedRef.current = false
      // since requests can never be deleted we should
      // consider using something like this:
      // setTimeout(refreshRequest, 500)
    }
  }

  // fetch request on load
  React.useEffect(() => {
    if (!fetchedRef.current) refreshRequest()
  })

  const isRequester = fetchedRef.current
    ? user.id === request.requester.id
    : null

  const isSharer = fetchedRef.current
    ? request.material.organization.members.includes(user.id)
    : null

  return (
    <RequestContext.Provider
      value={{
        request,
        setRequest,
        refreshRequest,
        isFetched: fetchedRef.current,
        isRequester,
        isSharer
      }}
    >
      {children}
    </RequestContext.Provider>
  )
}
