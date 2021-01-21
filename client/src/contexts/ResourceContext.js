import React from 'react'
import { useLocalStorage } from 'hooks/useLocalStorage'
import api from 'api'
import { useUser } from 'hooks/useUser'
import configs, { formDefaults } from 'components/resources/configs'
import { getSchema } from 'schemas/material'
import {
  isSupportedImportSource,
  getImportAttribute
} from 'components/resources'
import getOptionalAttributes from 'helpers/getOptionalAttributes'
import renamePersonalOrg from 'helpers/renamePersonalOrg'

export const ResourceContext = React.createContext({})

export const ResourceContextProvider = ({
  editResource = {},
  localStorageName = 'edit-resource',
  children
}) => {
  // replace the objects with their ids
  const cleanedEditResource = (savedResource) => {
    if (!savedResource.id) return savedResource

    const cleanedResource = { ...savedResource }
    cleanedResource.organization = savedResource.organization.id
    cleanedResource.contact_user = savedResource.contact_user.id
    return cleanedResource
  }

  const [resource, setResource] = useLocalStorage(
    localStorageName,
    cleanedEditResource(editResource)
  )
  const [fetched, setFetched] = useLocalStorage(
    `${localStorageName}-fetched`,
    false
  )

  const { user, token, refreshUser } = useUser()
  const [grantOptions, setGrantOptions] = React.useState([])
  const [contactUserOptions, setContactUserOptions] = React.useState([])
  const [teamResources, setTeamResources] = React.useState([])
  const [
    existingRequirementsResource,
    setExistingRequirementsResource
  ] = React.useState('')
  const [errors, setErrors] = React.useState([])
  const [form, setForm] = React.useState()
  const [schema, setSchema] = React.useState()
  const [config, setConfig] = React.useState()
  const [optionalAttributes, setOptionalAttributes] = React.useState()
  // refs for knowing when to update states
  const configRef = React.useRef()
  const categoryRef = React.useRef()
  const importedRef = React.useRef()
  const importSourceRef = React.useRef()

  const fetchRef = React.useRef(false)
  const refreshRef = React.useRef(false)

  React.useEffect(() => {
    // update user
    if (!refreshRef.curent) refreshUser()
    refreshRef.current = true
  }, [])

  React.useEffect(() => {
    // update depends on ->:
    //  - config changes      : category
    //  - schema changes      : category, imported
    //  - optional Attributes : category, imported
    //  - form changes        : category, imported, importSource

    const updatedCategory =
      resource &&
      resource.category &&
      (!categoryRef.current || categoryRef.current !== resource.category)

    const updatedImported =
      resource && importedRef.current !== resource.imported

    const updatedImportSource =
      resource &&
      !!resource.import_source &&
      (!importSourceRef.current ||
        importSourceRef.current !== resource.import_source)

    // config - update if they are different
    if (updatedCategory || configRef.current !== config) {
      configRef.current = configs[resource.category]
      setConfig(configRef.current)
    }

    // schema, optional attributes
    if (updatedCategory || updatedImported) {
      const newSchema = getSchema(resource)
      setOptionalAttributes(getOptionalAttributes(newSchema, resource))
      setSchema(newSchema)
    }

    // form
    if (
      (updatedCategory || updatedImported || updatedImportSource) &&
      configRef.current
    ) {
      if (resource.import_source) {
        setForm([
          ...configRef.current.importForm(resource.import_source),
          ...formDefaults
        ])
      } else if (resource.category) {
        setForm([...configRef.current.listForm, ...formDefaults])
      }
    }

    // update before next render
    categoryRef.current = resource.category
    importedRef.current = resource.imported
    importSourceRef.current = resource.import_source
  })

  // make this stuff lazy
  const organizationOptions = [...renamePersonalOrg(user.organizations || [])]

  const grant = resource
    ? grantOptions.find((g) => g.id === resource.grant_id) || {}
    : {}

  const isSupported = resource
    ? isSupportedImportSource(resource.import_source)
    : undefined
  const importAttribute = resource
    ? getImportAttribute(resource.import_source)
    : undefined

  React.useEffect(() => {
    if (resource && grantOptions.length === 0 && resource.organization) {
      didSetOrganization(resource.organization)
    }
  }, [resource])

  // this is a propagating fetch so context needs to own it
  const didSetOrganization = async (teamId) => {
    if (!fetchRef.current) {
      fetchRef.current = true
      // set grantOptions when team changes
      const grantsRequest = await api.teams.grants.get(teamId, token)
      const newGrantOptions = grantsRequest.isOk
        ? grantsRequest.response.results
        : []
      setGrantOptions(newGrantOptions)

      // set contactUserOptions when team changes
      const teamRequest = await api.teams.get(teamId, token)
      const members = teamRequest.isOk ? teamRequest.response.members : []
      setContactUserOptions(members)

      // set hasResources when team changes
      const resourcesRequest = await api.resources.filter({
        organization__id: teamId || resource.organization,
        imported: false,
        limit: 20
      })
      setTeamResources(resourcesRequest.response.results)

      fetchRef.current = false
    }
  }

  // explicitly destroy local storage
  const clearResourceContext = () => {
    setResource({})
    setFetched()
    setExistingRequirementsResource()
  }

  return (
    <ResourceContext.Provider
      value={{
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
      }}
    >
      {children}
    </ResourceContext.Provider>
  )
}
