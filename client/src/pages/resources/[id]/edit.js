import React from 'react'
import dynamic from 'next/dynamic'
import { Heading } from 'grommet'
import { Loader } from 'components/Loader'
import { ResourceContextProvider } from 'contexts/ResourceContext'
import api from 'api'

const ResourceEditForm = dynamic(
  () => import('components/resources/ResourceEditForm'),
  { ssr: false }
)

export const EditResource = ({ resourceId }) => {
  const [editResource, setEditResource] = React.useState()

  React.useEffect(() => {
    const fetchEditResource = async () => {
      const { isOk, response } = await api.resources.get(resourceId)
      if (isOk) setEditResource(response)
    }

    if (!editResource) fetchEditResource()
  })

  if (!editResource) return <Loader />

  return (
    <ResourceContextProvider editResource={editResource}>
      <Heading level={4} serif>
        Edit Resource - {editResource.title}
      </Heading>
      <ResourceEditForm />
    </ResourceContextProvider>
  )
}

EditResource.getInitialProps = ({ query: { id } }) => {
  return {
    resourceId: id
  }
}

export default EditResource
