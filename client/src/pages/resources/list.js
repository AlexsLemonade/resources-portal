import React from 'react'
import dynamic from 'next/dynamic'
import { ResourceContextProvider } from 'contexts/ResourceContext'

const ResourceForm = dynamic(
  () => import('components/resources/ListResourceForm'),
  { ssr: false }
)
export const ResourcesList = () => {
  // TODO:
  // - prevent people with no grants
  return (
    <ResourceContextProvider localStorageName="list-resource">
      <ResourceForm />
    </ResourceContextProvider>
  )
}

export default ResourcesList
