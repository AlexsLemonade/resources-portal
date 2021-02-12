import React from 'react'
import { Box, Grid, Tabs, Tab, Text } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import ManageRequestsTable from 'components/ManageRequestsTable'
import { Loader } from 'components/Loader'
import { useUser } from 'hooks/useUser'
import api from 'api'
import RequestOverviewCard from 'components/RequestOverviewCard'
import EmptyRequests from '../../../images/empty-requests.svg'

const Requests = () => {
  // fetch the requests
  const { user, token } = useUser()
  const [requests, setRequests] = React.useState()
  const [assigned, setAssigned] = React.useState([])
  const [received, setReceived] = React.useState([])
  const [closed, setClosed] = React.useState([])
  const [sent, setSent] = React.useState([])
  const hasAnyRequests = Array.isArray(requests) && requests.length > 0

  React.useEffect(() => {
    const fetchRequests = async () => {
      const requestsRequest = await api.requests.filter({ limit: 1000 }, token)
      if (requestsRequest.isOk) {
        const newRequests = requestsRequest.response.results
        setRequests(newRequests)
        // filter assigned
        const newAssigned = newRequests.filter(
          (r) => r.assigned_to === user.id && r.is_active_sharer
        )
        setAssigned(newAssigned)
        const newReceived = newRequests.filter(
          (r) => r.requester.id !== user.id && r.is_active_sharer
        )
        setReceived(newReceived)
        const newSent = newRequests.filter(
          (r) => r.requester.id === user.id && r.is_active_requester
        )
        setSent(newSent)
        const activeIds = [...newAssigned, ...newReceived, ...newSent].map(
          (r) => r.id
        )
        const newClosed = newRequests.filter((r) => !activeIds.includes(r.id))
        setClosed(newClosed)
      }
    }

    if (!requests) fetchRequests()
  })

  if (!requests) return <Loader />

  return (
    <DrillDownNav title="Requests">
      {!hasAnyRequests && (
        <AccountEmptyPage
          paragraphs={['You have not received or made any requests yet.']}
        >
          <EmptyRequests />
        </AccountEmptyPage>
      )}
      {hasAnyRequests && (
        <Box>
          <Tabs>
            <Tab title="Overview">
              <Grid
                columns={{
                  count: 3,
                  size: 'auto'
                }}
                margin={{ vertical: 'xlarge' }}
                gap="xlarge"
              >
                <RequestOverviewCard
                  label="Requests Assigned To You"
                  requests={assigned}
                />
                <RequestOverviewCard
                  label="Active Received Requests"
                  requests={received}
                />
                <RequestOverviewCard
                  label="Active Sent Requests"
                  requests={sent}
                />
                <RequestOverviewCard
                  label="Closed Requests"
                  requests={closed}
                />
              </Grid>
            </Tab>
            <Tab title="Received Requests">
              <Box margin={{ vertical: 'xlarge' }}>
                {received.length === 0 && (
                  <Text italic color="black-tint-60">
                    You have no active received requests.
                  </Text>
                )}
                {received.length > 0 && (
                  <ManageRequestsTable requests={received} />
                )}
              </Box>
            </Tab>
            <Tab title="Sent Requests">
              <Box margin={{ vertical: 'xlarge' }}>
                {sent.length === 0 && (
                  <Text italic color="black-tint-60">
                    You have no active sent requests.
                  </Text>
                )}

                {sent.length > 0 && <ManageRequestsTable requests={sent} />}
              </Box>
            </Tab>
            <Tab title="Closed Requests">
              <Box margin={{ vertical: 'xlarge' }}>
                {closed.length === 0 && (
                  <Text italic color="black-tint-60">
                    You have no closed requests.
                  </Text>
                )}

                {closed.length > 0 && <ManageRequestsTable requests={closed} />}
              </Box>
            </Tab>
          </Tabs>
        </Box>
      )}
    </DrillDownNav>
  )
}

export default Requests
