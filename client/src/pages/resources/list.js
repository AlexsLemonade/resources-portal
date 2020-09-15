import React from 'react'
import dynamic from 'next/dynamic'
import { Heading } from 'grommet'
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
      <Heading level={4} serif>
        List a Resource
      </Heading>
      <ResourceForm />
    </ResourceContextProvider>
  )
}

export default ResourcesList
