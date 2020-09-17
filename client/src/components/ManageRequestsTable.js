import React from 'react'
import { Box } from 'grommet'
import ManageRequestCard from 'components/ManageRequestCard'

export default ({ requests }) => {
  const [filteredRequests, setFilteredRequests] = React.useState(requests)
  //  const statuses = []
  //  const assignedTo = []
  //  const resourceTypes = []
  //  const teams = []

  return (
    <Box>
      {/* <RequestFilters filters={filter} onFilterChange={setFilteredRequests} /> */}
      {filteredRequests.map((request) => (
        <ManageRequestCard key={request.id} request={request} />
      ))}
    </Box>
  )
}
