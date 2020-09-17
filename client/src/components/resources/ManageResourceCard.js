import React from 'react'
import { Box, DropButton, Text, Anchor } from 'grommet'
import Link from 'next/link'
import { useUser } from 'hooks/useUser'
import api from 'api'
import Icon from 'components/Icon'
import { ResourceCard } from './ResourceCard'

export const ManageOptions = ({
  resource,
  options = [],
  direction,
  pad = 'none',
  openRequests
}) => {
  const manageLink = `/account/manage-resources/${resource.id}`
  const editLink = `/resources/${resource.id}/edit`
  const viewResourceLink = `resources/${resource.id}`

  const onArchive = () => {}
  const onDelete = () => {}

  return (
    <Box direction={direction} gap="medium" pad={pad}>
      {options.includes('manage') && (
        <Link href={manageLink}>
          <Anchor
            icon={<Icon name="Gear" size="small" />}
            label="Manage Resource"
            href={manageLink}
          />
        </Link>
      )}
      {options.includes('edit') && (
        <Link href={editLink}>
          <Anchor
            icon={<Icon name="Edit" size="small" />}
            label="Edit"
            href={editLink}
          />
        </Link>
      )}
      {options.includes('view') && (
        <Link href={viewResourceLink}>
          <Anchor
            icon={<Icon name="View" size="12px" />}
            label="View Resource"
            href={viewResourceLink}
          />
        </Link>
      )}
      {options.includes('archive') && (
        <Anchor
          icon={<Icon name="Archive" size="small" />}
          label="Archive"
          onClick={onArchive}
        />
      )}
      {options.includes('delete') && (
        <Anchor
          icon={<Icon name="Trashcan" size="small" color="error" />}
          color="error"
          label="Delete"
          onClick={onDelete}
          disabled={openRequests > 0}
        />
      )}
    </Box>
  )
}

export const ManageResourceCard = ({
  resource,
  options = [],
  moreOptions = []
}) => {
  const { token, getTeam, isPersonalResource } = useUser()
  const manageLink = `/account/manage-resources/${resource.id}`
  const team = getTeam(resource.organization)
  const teamLink = `/account/teams/${team.id}`

  const [openRequests, setOpenRequests] = React.useState()

  React.useState(() => {
    const fetchRequests = async () => {
      const request = await api.resources.requests.filter(
        resource.id,
        { limit: 0 },
        token
      )
      if (request.isOk) setOpenRequests(request.response.count)
    }

    if (!openRequests) fetchRequests()
  })

  // the content for More Options dropdown
  const dropContent = (
    <ManageOptions
      pad={{ vertical: 'small', horizontal: 'medium' }}
      resource={resource}
      options={moreOptions}
      openRequests={openRequests}
    />
  )

  return (
    <Box>
      <ResourceCard resource={resource}>
        <Box direction="row" gap="medium">
          <ManageOptions
            direction="row"
            resource={resource}
            options={options}
            openRequests={openRequests}
          />
          {moreOptions.length > 0 && (
            <DropButton
              plain
              icon={<Icon name="MoreOptions" size="small" />}
              label="More Options"
              dropAlign={{ top: 'bottom' }}
              dropContent={dropContent}
            />
          )}
        </Box>
      </ResourceCard>
      <Box
        border={{ side: 'top', color: 'black-tint-95', size: 'small' }}
        direction="row"
        align="center"
        pad={{ top: 'small' }}
        margin={{ top: 'small' }}
      >
        {!isPersonalResource(resource) && (
          <>
            <Link href={teamLink}>
              <Anchor href={teamLink} label={team.name} />
            </Link>
            <Box
              background="brand"
              round
              width="8px"
              height="8px"
              margin="small"
            />
          </>
        )}
        {openRequests > 0 ? (
          <Link href={manageLink}>
            <Anchor href={manageLink} label={`${openRequests} Open Requests`} />
          </Link>
        ) : (
          <Text>0 Open Requests</Text>
        )}
        <Box background="brand" round width="8px" height="8px" margin="small" />
        <Text>Publicly Available</Text>
      </Box>
    </Box>
  )
}

export default ManageResourceCard
