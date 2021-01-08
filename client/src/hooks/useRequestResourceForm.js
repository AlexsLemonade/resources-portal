import React from 'react'
import { useUser } from 'hooks/useUser'
import api from 'api'
import getErrorMessages from 'helpers/getErrorMessages'
import { getCreateRequestSchema } from 'schemas/materialRequest'
import { useAlertsQueue } from 'hooks/useAlertsQueue'

export default (resource = {}, requestId) => {
  const { addAlert } = useAlertsQueue()
  const schema = getCreateRequestSchema(resource)
  const { user, token, refreshUser } = useUser()
  const [request, setRequest] = React.useState({ material: resource.id })
  const [validationErrors, setValidationErrors] = React.useState({})
  const fetchedUserRef = React.useRef(false)

  React.useEffect(() => {
    if (requestId && !request.id) fetchRequest(requestId)
    if (!fetchedUserRef.current) {
      refreshUser()
      fetchedUserRef.current = true
    }
  })

  const setAddress = (address) => {
    const filterKeys = [
      'id',
      'user',
      'created_at',
      'updated_at',
      'saved_for_reuse'
    ]
    const newAddress = Object.fromEntries(
      Object.entries(address).filter(([k]) => !filterKeys.includes(k))
    )

    setAttribute('address', newAddress)
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
    if (!(await validateNewRequest())) {
      addAlert('There are fields that need review.', 'error')
      return false
    }

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
        // send to sentry & alert error
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

  const validateNewRequest = async () => {
    try {
      await schema.validate(request, { abortEarly: false })
      setValidationErrors({})
    } catch (errors) {
      const errorMessages = getErrorMessages(errors)
      setValidationErrors(errorMessages)
      return false
    }

    return true
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
    setAddress,
    validationErrors
  }
}
