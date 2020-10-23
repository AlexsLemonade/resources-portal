import React from 'react'
import dynamic from 'next/dynamic'
import { Heading } from 'grommet'
import { ResourceContextProvider } from 'contexts/ResourceContext'

const LoginRequired = dynamic(() => import('components/LoginRequired'), {
  ssr: false
})

const ImportResource = dynamic(
  () => import('components/resources/ImportResource'),
  { ssr: false }
)

export const ResourcesImport = () => {
  return (
    <LoginRequired title="You Must Login To Import a Resource">
      <ResourceContextProvider localStorageName="import-resource">
        <Heading level={4} serif>
          Import a Resource
        </Heading>
        <ImportResource />
      </ResourceContextProvider>
    </LoginRequired>
  )
}

export default ResourcesImport
