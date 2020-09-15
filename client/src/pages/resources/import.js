import React from 'react'
import dynamic from 'next/dynamic'
import { Heading } from 'grommet'
import { ResourceContextProvider } from 'contexts/ResourceContext'

const ImportResource = dynamic(
  () => import('components/resources/ImportResource'),
  { ssr: false }
)
export const ResourcesImport = () => {
  return (
    <ResourceContextProvider localStorageName="import-resource">
      <Heading level={4} serif>
        Import a Resource
      </Heading>
      <ImportResource />
    </ResourceContextProvider>
  )
}

export default ResourcesImport
