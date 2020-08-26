import React from 'react'
import { Box } from 'grommet'
import { useUser } from 'hooks/useUser'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import { ManageResourceCard } from 'components/resources/ManageResourceCard'
import { Loader } from 'components/Loader'
import api from 'api'
import EmptyManageResources from '../../../images/empty-manage-resources.svg'

const ManageResources = () => {
  const {
    user: { personal_organization: personalOrganization },
    token
  } = useUser()
  const [resources, setResources] = React.useState(false)

  React.useEffect(() => {
    const asyncResourceFetch = async () => {
      const userResourcesRequest = await api.teams.resources.get(
        personalOrganization.id,
        token
      )
      const {
        response: { results }
      } = userResourcesRequest
      setResources(results)
    }
    if (!resources) asyncResourceFetch()
  })

  return (
    <DrillDownNav title="Manage Resources">
      {!resources && <Loader />}
      {resources && resources.length === 0 && (
        <AccountEmptyPage
          paragraphs={['You have not added any resources.']}
          buttonLabel="Add Resources"
          link="/resources"
        >
          <EmptyManageResources />
        </AccountEmptyPage>
      )}
      {resources &&
        resources.map((resource) => (
          <Box key={resource.id} margin={{ vertical: 'medium' }}>
            <Box elevation="small" pad="medium">
              <ManageResourceCard resource={resource} />
            </Box>
          </Box>
        ))}
    </DrillDownNav>
  )
}

export default ManageResources
