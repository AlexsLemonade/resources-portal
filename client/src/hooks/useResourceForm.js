import React from 'react'
import {
  isMetadataAttribute,
  isShippingAttribute,
  getImportSourceCategory
} from 'components/resources'
import { getToken, getReadable } from 'helpers/readableNames'
import { ResourceContext } from 'contexts/ResourceContext'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import api from 'api'

export default () => {
  const {
    user,
    token,
    resource,
    setResource,
    fetched,
    setFetched,
    grantOptions,
    contactUserOptions,
    errors,
    setErrors,
    didSetOrganization,
    clearResourceContext,
    teamResources,
    existingRequirementsResource,
    setExistingRequirementsResource,
    config,
    schema,
    importAttribute,
    form,
    grant,
    isSupported,
    organizationOptions,
    optionalAttributes
  } = React.useContext(ResourceContext)
  const { addAlert } = useAlertsQueue()

  const removeMtaAttachment = async () => {
    const mta = getAttribute('mta_attachment')
    if (mta && mta.id) {
      const attachmentRequest = await api.attachments.delete(mta.id, token)
      if (attachmentRequest.isOk) {
        setAttribute('mta_attachment', undefined)
      }
    }
  }

  const setMtaAttachment = async (files) => {
    const [file] = files
    const ownedByOrg = getAttribute('organization')
    const attachmentRequest = await api.attachments.create(
      { file, owned_by_org: ownedByOrg },
      token
    )
    if (attachmentRequest.isOk) {
      await removeMtaAttachment()
      setAttribute('mta_attachment', attachmentRequest.response)
    }
  }

  const validate = async (onValid) => {
    try {
      await schema.validate(resource, { abortEarly: false })
      onValid()
    } catch (validationError) {
      const { inner: attributeErrors } = validationError
      const invalidAttributes = attributeErrors.map((error) => {
        const attr = error.path.replace('additional_metadata.', '')
        return attr
      })
      const alertMessage =
        invalidAttributes.length > 1
          ? 'Please add required fields.'
          : `${getReadable(invalidAttributes[0])} is required.`
      addAlert(alertMessage, 'error')
      setErrors(invalidAttributes)
    }
  }

  const validateShippingRequirement = () => {
    if (existingRequirementsResource && existingRequirementsResource.id)
      return true

    const shippingRequirement = getAttribute('shipping_requirement')
    const sharerPaysShipping = getAttribute('sharer_pays_shipping')

    if (shippingRequirement && !sharerPaysShipping) {
      // should probably also require Restrictions
      // if accepts_other_payment_methods or
      // accepts_shipping_code
      const acceptsShippingCode = getAttribute('accepts_shipping_code')
      const acceptsReimbursement = getAttribute('accepts_reimbursement')
      const acceptsOtherPaymentMethods = getAttribute(
        'accepts_other_payment_methods'
      )

      const acceptedPaymentDetails = getAttribute('accepted_payment_details')

      const hasOne =
        acceptsShippingCode ||
        acceptsReimbursement ||
        acceptsOtherPaymentMethods

      if (!hasOne) {
        addAlert(
          'Please select at least one accepted shipping payment methods',
          'error'
        )
        return false
      }

      const needsSpecification =
        acceptsShippingCode || acceptsOtherPaymentMethods

      if (needsSpecification && !acceptedPaymentDetails) {
        addAlert(
          'Please provide details about accepted shipping payment methods',
          'error'
        )
        return false
      }
    }

    return true
  }

  const attributeHasError = (attribute) => errors.includes(attribute)

  const getAttribute = (attribute) => {
    if (!isMetadataAttribute(attribute)) {
      return resource[attribute]
    }
    if (isShippingAttribute(attribute)) {
      const shippingRequirement = resource.shipping_requirement || {}
      // when requester pays these are mandatory
      return shippingRequirement[attribute]
    }
    // if no metadatas set return undefined
    if (resource.additional_metadata) {
      return resource.additional_metadata[attribute]
    }
    return undefined
  }

  const setAttribute = (attribute, value) => {
    // eventually we will need to support grant_ids array
    const updatedResource = {
      additional_metadata: {},
      ...resource
    }
    if (isShippingAttribute(attribute)) {
      const newShippingRequirement = resource.shipping_requirement || {}
      newShippingRequirement[attribute] = value
      if (attribute === 'sharer_pays_shipping' && value) {
        newShippingRequirement.accepts_shipping_code = false
        newShippingRequirement.accepts_reimbursement = false
        newShippingRequirement.accepts_other_payment_methods = false
        delete newShippingRequirement.accepted_payment_details
      }
      updatedResource.shipping_requirement = newShippingRequirement
    } else if (attribute === 'organization') {
      updatedResource[attribute] = value.id
      didSetOrganization(value.id)
    } else if (attribute === 'contact_user') {
      updatedResource[attribute] = value ? value.id : value
    } else if (attribute === 'category') {
      updatedResource.category = getToken(value)
    } else if (attribute === 'import_source') {
      updatedResource.import_source = value
      updatedResource.category = getImportSourceCategory(value)
    } else if (isMetadataAttribute(attribute)) {
      updatedResource.additional_metadata[attribute] = value
    } else {
      updatedResource[attribute] = value
    }

    if (['category', 'import_source', importAttribute].includes(attribute)) {
      const {
        category,
        organization,
        grants,
        import_source: importSource
      } = updatedResource
      const resetResource = {
        category,
        organization,
        grants,
        import_source: importSource,
        url: '',
        additional_metadata: {}
      }
      if (attribute === importAttribute) {
        resetResource.additional_metadata[importAttribute] =
          updatedResource.additional_metadata[importAttribute]
      }

      setResource(resetResource)
      setFetched(false)
    } else {
      setResource(updatedResource)
    }

    // after validating remove error while entering
    if (errors.includes(attribute))
      setErrors(errors.filter((e) => e !== attribute))
  }

  const saveShippingRequirement = async () => {
    const shippingRequirement = getAttribute('shipping_requirement')

    if (shippingRequirement) {
      shippingRequirement.organization = getAttribute('organization')

      const shippingRequest = shippingRequirement.id
        ? await api.shippingRequirements.update(
            shippingRequirement.id,
            shippingRequirement,
            token
          )
        : await api.shippingRequirements.create(shippingRequirement, token)

      if (shippingRequest.isOk) {
        setAttribute('shipping_requirement', shippingRequest.response)
        return shippingRequest.response
      }
    }
    return undefined
  }

  const saveSequenceMaps = async (savedResource) => {
    const sequenceMaps = getAttribute('sequence_maps')
    // save material/sequence map association
    if (sequenceMaps) {
      await Promise.all(
        sequenceMaps.map((map) =>
          api.attachments.update(
            map.id,
            { sequence_map_for: savedResource.id },
            token
          )
        )
      )
    }
  }

  const saveGrants = async (savedResource) => {
    const newGrants = getAttribute('grants') || []
    const existingGrants = savedResource.grants
    const requests = []
    const newGrantIds = newGrants.map((g) => g.id)
    const existingGrantIds = existingGrants.map((g) => g.id)

    existingGrantIds.forEach((existingGrantId) => {
      if (!newGrantIds.includes(existingGrantId)) {
        requests.push(
          api.grants.material.delete(existingGrantId, savedResource.id, token)
        )
      }
    })

    newGrantIds.forEach((newGrantId) => {
      if (!existingGrantIds.includes(newGrantId)) {
        requests.push(
          api.grants.material.create(newGrantId, savedResource.id, token)
        )
      }
    })

    await Promise.all(requests)
  }

  const save = async () => {
    const saveResource = { ...resource }
    // these are posted after created
    delete saveResource.sequence_maps
    delete saveResource.grants

    // remove empty organisms
    if (saveResource.organisms) {
      saveResource.organisms = saveResource.organisms.filter((o) => Boolean(o))
    }

    if (existingRequirementsResource.id) {
      // apply requirements from existing resource
      saveResource.needs_abstract = existingRequirementsResource.needs_abstract
      saveResource.needs_irb = existingRequirementsResource.needs_irb

      if (existingRequirementsResource.mta_attachment) {
        const cloneRequest = await api.attachments.copy(
          existingRequirementsResource.mta_attachment.id,
          token
        )
        if (cloneRequest.isOk) {
          saveResource.mta_attachment = cloneRequest.response.id
        }
      }

      if (existingRequirementsResource.shipping_requirement) {
        const {
          shipping_requirement: cloneShippingRequirement
        } = existingRequirementsResource
        delete cloneShippingRequirement.id
        const cloneShippingRequest = await api.shippingRequirements.create(
          cloneShippingRequirement,
          token
        )
        if (cloneShippingRequest.isOk) {
          saveResource.shipping_requirement = cloneShippingRequest.response.id
        }
      }
    } else {
      // shipping requirement
      delete saveResource.shipping_requirement
      const shippingRequirement = await saveShippingRequirement()
      if (shippingRequirement) {
        saveResource.shipping_requirement = shippingRequirement.id
      }

      // mta attachment
      delete saveResource.mta_attachment
      const mtaAttachment = getAttribute('mta_attachment')
      // this wants an integer not an object
      if (mtaAttachment) {
        saveResource.mta_attachment = mtaAttachment.id
      }
    }

    if (config.titleAttribute) {
      // we need to choose the title for the resource based on the attributes
      saveResource.title = getAttribute(config.titleAttribute)
    }

    const { isOk, response: savedResource } = saveResource.id
      ? await api.resources.update(saveResource.id, saveResource, token)
      : await api.resources.create(saveResource, token)

    if (isOk) {
      await saveSequenceMaps(savedResource)
      await saveGrants(savedResource)
    } else {
      return {}
    }

    // should optionally set the resource here from the saved version
    const {
      isOk: returnedOk,
      response: associatedResource
    } = await api.resources.get(savedResource.id)

    if (returnedOk) {
      return associatedResource
    }
    return savedResource
  }

  const fetchImport = async () => {
    const importSource = getAttribute('import_source')
    const importRequest = await api.resources.import(
      {
        import_source: importSource,
        [importAttribute]: getAttribute(importAttribute)
      },
      token
    )
    if (importRequest.isOk) {
      const { response } = importRequest
      setResource({
        ...resource,
        ...response,
        imported: true,
        contact_user: user.id
      })
    }
    setFetched(importRequest.isOk)
    return importRequest.isOk
  }

  return {
    user,
    config,
    form,
    importAttribute,
    isSupported,
    fetchImport,
    fetched,
    setFetched,
    resource,
    getAttribute,
    setAttribute,
    organizationOptions,
    grantOptions,
    setMtaAttachment,
    removeMtaAttachment,
    contactUserOptions,
    validate,
    validateShippingRequirement,
    attributeHasError,
    errors,
    grant,
    save,
    clearResourceContext,
    teamResources,
    existingRequirementsResource,
    setExistingRequirementsResource,
    isSaved: !!resource.id,
    optionalAttributes
  }
}
