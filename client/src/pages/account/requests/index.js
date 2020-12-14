import React from 'react'
import { Box, Tabs, Tab, Text } from 'grommet'
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
  const [sent, setSent] = React.useState([])
  const hasReceived = received && received.length > 0
  const hasSent = sent && sent.length > 0
  const hasAnyRequests = hasReceived || hasSent

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
              <Box
                direction="row"
                gap="xxlarge"
                margin={{ vertical: 'xlarge' }}
                alignContent="stretch"
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
                  label="Acitve Sent Requests"
                  requests={sent}
                />
              </Box>
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
          </Tabs>
        </Box>
      )}
    </DrillDownNav>
  )
}

export default Requests
