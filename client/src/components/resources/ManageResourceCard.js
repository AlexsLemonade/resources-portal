import React from 'react'
import { Box, Text, Anchor } from 'grommet'
import Link from 'next/link'
import { ResourceCard } from './ResourceCard'

export const ManageResourceCard = ({ resource }) => {
  // How do we get pending requests
  // What do we link to when there are pending requests
  const editLink = `/resources/${resource.id}/edit`
  const teamLink = `/account/teams/${resource.organization.id}`
  const manageLink = `/account/manage-resources/${resource.id}`

  // modal for deleting a resource?

  return (
    <Box>
      <ResourceCard resource={resource}>
        <Box direction="row" gap="large">
          <Link href={editLink}>
            <Anchor label="Edit" href={editLink} />
          </Link>
          <Link href={manageLink}>
            <Anchor label="Manage Resource" href={manageLink} />
          </Link>
          <Anchor label="Delete" />
        </Box>
      </ResourceCard>
      <Box
        border={{ side: 'top', color: 'black-tint-95', size: 'small' }}
        direction="row"
        align="center"
        pad={{ top: 'small' }}
        margin={{ top: 'small' }}
      >
        <Link href={teamLink}>
          <Anchor href={teamLink} label={resource.organization.name} />
        </Link>
        <Box background="brand" round width="8px" height="8px" margin="small" />
        <Text>0 pending requests</Text>
        <Box background="brand" round width="8px" height="8px" margin="small" />
        <Text>Publicly Available</Text>
      </Box>
    </Box>
  )
}

export default ManageResourceCard
