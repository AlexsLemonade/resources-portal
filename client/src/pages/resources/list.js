import React from 'react'
import dynamic from 'next/dynamic'
import { ResourceContextProvider } from 'contexts/ResourceContext'

const GrantRequired = dynamic(() => import('components/GrantRequired'), {
  ssr: false
})
const LoginRequired = dynamic(() => import('components/LoginRequired'), {
  ssr: false
})

const ResourceForm = dynamic(
  () => import('components/resources/ListResourceForm'),
  { ssr: false }
)
export const ResourcesList = () => {
  return (
    <LoginRequired title="You Must Login To List a Resource">
      <GrantRequired>
        <ResourceContextProvider localStorageName="list-resource">
          <ResourceForm />
        </ResourceContextProvider>
      </GrantRequired>
    </LoginRequired>
  )
}

export default ResourcesList
