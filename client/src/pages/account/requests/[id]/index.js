import React from 'react'
import { DrillDownNav } from 'components/DrillDownNav'

export const Request = ({ id }) => {
  return (
    <DrillDownNav label="View Request" linkBack="/account/requests">
      Edit the Request {id}
    </DrillDownNav>
  )
}

Request.getInitialProps = ({ query: { id } }) => {
  return { id }
}

export default Request
