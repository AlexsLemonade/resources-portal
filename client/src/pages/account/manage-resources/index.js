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
  const { user, token } = useUser()
  const [resources, setResources] = React.useState(false)
  const [refresh, setRefresh] = React.useState(false)

  React.useEffect(() => {
    const asyncResourceFetch = async () => {
      const resourceRequestPromises = user.organizations.map(({ id: teamId }) =>
        api.teams.resources.get(teamId, token)
      )

      const resourceRequests = await Promise.all(resourceRequestPromises)

      const fetchedResources = resourceRequests.map((request) => {
        if (request.isOk) return request.response.results
        return []
      })

      setRefresh(false)
      setResources([].concat(...fetchedResources))
    }

    if (!resources || refresh) asyncResourceFetch()
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
          <Box
            key={resource.id}
            margin={{ vertical: 'medium' }}
            elevation="medium"
            pad={{ vertical: 'medium', horizontal: 'large' }}
          >
            <ManageResourceCard
              resource={resource}
              options={['edit', 'manage']}
              moreOptions={['view', 'archive', 'delete']}
              onChange={() => setRefresh(true)}
            />
          </Box>
        ))}
    </DrillDownNav>
  )
}

export default ManageResources
