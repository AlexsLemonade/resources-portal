import React from 'react'
import { Box } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { HeaderRow } from 'components/HeaderRow'
import { ManageResourceCard } from 'components/resources/ManageResourceCard'
import { RequestRequirements } from 'components/resources/RequestRequirements'
import api from 'api'

const ManageResource = ({ resource }) => {
  const pendingRequestsCount = '(3)'
  const closedRequestsCount = '(4)'

  return (
    <DrillDownNav title="Manage Resources" linkBack="/account/manage-resources">
      <Box>
        <ManageResourceCard resource={resource} />
      </Box>
      <Box>
        <HeaderRow label="Request Requirements" />
        <RequestRequirements resource={resource} />
      </Box>
      <Box>
        <HeaderRow label={`Pending Requests ${pendingRequestsCount}`} />
        ManageRequestsTable
      </Box>
      <Box>
        <HeaderRow label={`Closed Requests ${closedRequestsCount}`} />
        ClosedRequestsModal
      </Box>
    </DrillDownNav>
  )
}

ManageResource.getInitialProps = async ({ query }) => {
  const apiResponse = await api.resources.find(query.id)
  return {
    resource: apiResponse.isOk ? apiResponse.response : false
  }
}

export default ManageResource
