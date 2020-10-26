import React from 'react'
import dynamic from 'next/dynamic'
import { ResourceContextProvider } from 'contexts/ResourceContext'

const LoginRequired = dynamic(() => import('components/LoginRequired'), {
  ssr: false
})

const ResourceForm = dynamic(
  () => import('components/resources/ListResourceForm'),
  { ssr: false }
)
export const ResourcesList = () => {
  // TODO:
  // - prevent people with no grants
  return (
    <LoginRequired title="You Must Login To List a Resource">
      <ResourceContextProvider localStorageName="list-resource">
        <ResourceForm />
      </ResourceContextProvider>
    </LoginRequired>
  )
}

export default ResourcesList
