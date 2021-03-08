import React from 'react'
import { Box, Button, Text } from 'grommet'
import { useUser } from 'hooks/useUser'
import { DrillDownNav } from 'components/DrillDownNav'
import { HeaderRow } from 'components/HeaderRow'
import { ManageResourceCard } from 'components/resources/ManageResourceCard'
import { RequestRequirements } from 'components/resources/RequestRequirements'
import ManageRequestsTable from 'components/ManageRequestsTable'
import { Modal } from 'components/Modal'
import ScrollTo from 'components/ScrollTo'
import api from 'api'

const ManageResource = ({ resourceId }) => {
  const { token } = useUser()
  const [resource, setResource] = React.useState()
  const [openRequests, setOpenRequests] = React.useState([])
  const [closedRequests, setClosedRequests] = React.useState([])
  const [showClosedModal, setShowClosedModal] = React.useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      const resourceRequest = await api.resources.get(resourceId, token)
      setResource(resourceRequest.isOk ? resourceRequest.response : false)
      const openRequest = await api.resources.requests.filter(
        resourceId,
        { is_active_sharer: true },
        token
      )

      setOpenRequests(openRequest.isOk ? openRequest.response.results : [])
      const closedRequest = await api.resources.requests.filter(
        resourceId,
        { is_active_sharer: false },
        token
      )
      setClosedRequests(
        closedRequest.isOk ? closedRequest.response.results : []
      )
    }
    if (!resource) fetchData()
  })

  return (
    <DrillDownNav title="Manage Resources" linkBack="/account/manage-resources">
      {resource && (
        <Box margin={{ bottom: 'medium' }}>
          <Box>
            <ManageResourceCard
              resource={resource}
              options={['edit', 'view']}
              moreOptions={['archive', 'delete']}
            />
          </Box>
          <Box>
            <HeaderRow label="Request Requirements" />
            <RequestRequirements resource={resource} oneSection />
          </Box>
          {!resource.imported && (
            <Box height={{ min: '100vh' }}>
              <ScrollTo name="open-requests">
                <Box>
                  <HeaderRow label={`Open Requests (${openRequests.length})`} />
                  {openRequests.length === 0 && (
                    <Text textAlign="center" italic color="black-tint-60">
                      There are no open requests for this resource
                    </Text>
                  )}
                  {openRequests.length > 0 && (
                    <ManageRequestsTable requests={openRequests} />
                  )}
                </Box>
              </ScrollTo>
              <Box>
                <HeaderRow
                  label={`Closed Requests (${closedRequests.length})`}
                />
                {closedRequests.length === 0 && (
                  <Text textAlign="center" italic color="black-tint-60">
                    There are no closed requests for this resource
                  </Text>
                )}
                {closedRequests.length > 0 && (
                  <>
                    <Button
                      label="View Closed Requests"
                      onClick={() => setShowClosedModal(true)}
                    />
                    <Modal
                      showing={showClosedModal}
                      setShowing={setShowClosedModal}
                    >
                      <ManageRequestsTable requests={closedRequests} />
                    </Modal>
                  </>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </DrillDownNav>
  )
}

ManageResource.getInitialProps = ({ query: { id } }) => {
  return { resourceId: id }
}

export default ManageResource
