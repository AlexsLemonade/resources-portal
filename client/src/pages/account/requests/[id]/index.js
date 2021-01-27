import React from 'react'
import dynamic from 'next/dynamic'
import { DrillDownNav } from 'components/DrillDownNav'
import { RequestContextProvider } from 'contexts/RequestContext'

const ManageRequestForm = dynamic(
  () => import('components/ManageRequestForm'),
  { ssr: false }
)

export const Request = ({ id }) => {
  return (
    <DrillDownNav title="Request Details" linkBack="/account/requests">
      <RequestContextProvider requestId={id}>
        <ManageRequestForm />
      </RequestContextProvider>
    </DrillDownNav>
  )
}

Request.getInitialProps = ({ query: { id } }) => {
  return { id }
}

export default Request
