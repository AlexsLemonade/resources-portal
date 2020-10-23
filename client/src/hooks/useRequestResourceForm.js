import React from 'react'
import { useUser } from 'hooks/useUser'
import api from 'api'

export default (resource = {}, requestId) => {
  const { user, token, refreshUser } = useUser()
  const [request, setRequest] = React.useState({ material: resource.id })
  const fetchedUserRef = React.useRef(false)

  React.useEffect(() => {
    if (requestId && !request.id) fetchRequest(requestId)
    if (!fetchedUserRef.current) {
      refreshUser()
      fetchedUserRef.current = true
    }
  })

  const setAddress = (address) => {
    Object.entries(address)
      .filter(([k]) => !['id', 'user', 'created_at', 'updated_at'].includes(k))
      .forEach((entry) => setAddressAttribute(...entry))
  }

  const setAttribute = (attribute, value) => {
    const updatedRequest = { ...request }
    updatedRequest[attribute] = value
    setRequest(updatedRequest)
  }

  const getAttribute = (attribute) => {
    return request[attribute]
  }

  const setAddressAttribute = (attribute, value) => {
    const updatedRequest = { ...request }
    const address = updatedRequest.address || {}

    address[attribute] = value

    updatedRequest.address = address

    setRequest(updatedRequest)
  }

  const getAddressAttribute = (attribute) => {
    const address = request.address || {}
    return address[attribute]
  }

  const fetchRequest = async () => {
    const materialRequestRequest = await api.requests.get(requestId, token)
    if (materialRequestRequest.isOk) setRequest(materialRequestRequest.response)
  }

  const createResourceRequest = async () => {
    const saveRequest = { ...request }

    if (saveRequest.address) {
      const { address } = saveRequest

      // was already saved
      if (address.id) {
        delete address.id
        address.save_for_reuse = false
      }

      const addressRequest = await api.users.addresses.create(
        user.id,
        address,
        token
      )

      if (addressRequest.isOk) {
        saveRequest.address = addressRequest.response.id
      } else {
        console.log(addressRequest.response)
        return false
      }
    }

    const saveRequestRequest = await api.requests.create(
      { ...saveRequest, material: resource.id },
      token
    )
    if (saveRequestRequest.isOk) {
      setRequest(saveRequestRequest.response)
      return saveRequestRequest.response
    }
    return false
  }

  const saveChanges = async (changes) => {
    const updateRequestRequest = api.requests.update(request.id, changes, token)
    if (updateRequestRequest.isOk) {
      setRequest(updateRequestRequest.response)
      return updateRequestRequest.response
    }
    return false
  }

  return {
    request,
    addresses: user.addresses,
    setAttribute,
    getAttribute,
    setAddressAttribute,
    getAddressAttribute,
    fetchRequest,
    createResourceRequest,
    saveChanges,
    setAddress
  }
}
