import React from 'react'
import { Box, Tabs, Tab } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import EmptyRequests from '../../../images/empty-requests.svg'

const Requests = () => {
  const receivedRequests = []
  const sentRequests = []

  const hasAnyRequests = receivedRequests.length > 0 || sentRequests.length > 0

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
            <Tab label="Overview">
              <Box
                direction="row"
                gap="xlarge"
                margin={{ vertical: 'xlarge' }}
                alignContent="stretch"
              >
                <Box background="brand" pad="xlarge" align="center" fill>
                  Total
                </Box>
                <Box background="brand" pad="xlarge" align="center" fill>
                  Total
                </Box>
                <Box background="brand" pad="xlarge" align="center" fill>
                  Total
                </Box>
              </Box>
            </Tab>
            <Tab label="Received Requests">OverView</Tab>
            <Tab label="Sent Requests">OverView</Tab>
          </Tabs>
        </Box>
      )}
    </DrillDownNav>
  )
}

export default Requests
