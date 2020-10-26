import React from 'react'
import { Box, Button, Heading } from 'grommet'
import api from '../../api'
import { ResourceCard } from './ResourceCard'

export const RelatedResources = ({ resource }) => {
  const [resources, setResources] = React.useState(false)
  React.useEffect(() => {
    const asyncResourceFetch = async () => {
      const relatedRequest = await api.resources.filter({
        organization__id: resource.organization,
        limit: 3
      })

      if (relatedRequest.isOk) {
        setResources(relatedRequest.response.results)
      } else {
        setResources([])
      }
    }
    if (!resources) asyncResourceFetch()
  })

  if (!resources) return 'Loading...'
  if (resources.length === 0) return false

  return (
    <Box
      border={{ side: 'top', color: 'black-tint-95', size: 'small' }}
      margin={{ vertical: 'xlarge' }}
    >
      <Heading margin={{ bottom: 'medium' }} level="5">
        Related Resources
      </Heading>
      <Box direction="row" gap="large">
        {resources.map((relatedResource) => (
          <Box
            key={relatedResource.id}
            basis="1/3"
            pad="medium"
            elevation="medium"
          >
            <ResourceCard resource={relatedResource} stack>
              <Button primary label="View" />
            </ResourceCard>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default RelatedResources
