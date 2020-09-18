import React from 'react'
import { Box, Button, DropButton, Text, Anchor } from 'grommet'
import Link from 'next/link'
import { useUser } from 'hooks/useUser'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import api from 'api'
import Icon from 'components/Icon'
import { Modal } from 'components/Modal'
import { ResourceCard } from './ResourceCard'

export const ManageOptions = ({
  resource,
  options = [],
  direction,
  pad = 'none',
  openRequests,
  onChange
}) => {
  const { token } = useUser()
  const { addAlert } = useAlertsQueue()
  const [showDelete, setShowDelete] = React.useState(false)
  const [showArchive, setShowArchive] = React.useState(false)
  const manageLink = `/account/manage-resources/${resource.id}`
  const editLink = `/resources/${resource.id}/edit`
  const viewResourceLink = `resources/${resource.id}`

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
        <>
          <Box
            border={{ side: 'bottom', color: 'border-black', size: 'small' }}
          >
            <Text>Archive Resource</Text>
          </Box>
          <Anchor
            icon={<Icon name="Archive" size="small" />}
            label="Archive"
            onClick={() => setShowArchive(true)}
          />
          <Modal showing={showArchive} setShowing={setShowArchive}>
            <>
              {openRequests === 0 && (
                <Box>
                  <Box direction="row">
                    <Icon name="Warning" color="warning" />
                    <Text>Are you sure you want to archive this resource?</Text>
                  </Box>
                  <Box>
                    <Text>
                      Researchers will not be able to request for this resource
                      but they will still be able to review it.
                    </Text>
                  </Box>
                  <Box>
                    <Button
                      label="Cancel"
                      onClick={() => setShowArchive(false)}
                    />
                    <Button
                      primary
                      label="Archive Resource"
                      onClick={async () => {
                        const archiveRequest = await api.resource.update(
                          resource.id,
                          { is_archived: true },
                          token
                        )
                        if (archiveRequest.isOk) {
                          onChange()
                        } else {
                          addAlert('Unable to archive resource', 'error')
                        }
                      }}
                    />
                  </Box>
                </Box>
              )}
              {openRequests !== 0 && (
                <Box>
                  <Box direction="row">
                    <Icon name="Warning" color="warning" />
                    <Text>Cannot archive resource with open requests.</Text>
                  </Box>
                  <Box>
                    <Text>
                      Your resource has{' '}
                      <Link href={viewResourceLink}>
                        <Anchor
                          label={`${openRequests} open requests`}
                          href={viewResourceLink}
                        />
                      </Link>
                      {'. '}
                      Please accept or reject those requests before archiving
                      this resource.
                    </Text>
                  </Box>
                  <Box>
                    <Link href={viewResourceLink}>
                      <Button
                        as="a"
                        label="Show Requests"
                        href={viewResourceLink}
                      />
                    </Link>
                  </Box>
                </Box>
              )}
            </>
          </Modal>
        </>
      )}
      {options.includes('delete') && (
        <>
          <Anchor
            icon={<Icon name="Trashcan" size="small" color="error" />}
            color="error"
            label="Delete"
            onClick={() => setShowDelete(true)}
            disabled={openRequests > 0}
          />
          <Modal showing={showDelete} setShowing={setShowDelete}>
            <>
              <Box
                border={{
                  side: 'bottom',
                  color: 'border-black',
                  size: 'small'
                }}
              >
                <Text size="large" color="error">
                  Delete Resource
                </Text>
              </Box>
              <Box>
                <Text>Are you sure you want to delete this resource?</Text>
                <Text>{resource.title}</Text>
                <Box>
                  <Box>
                    <Button
                      label="Cancel"
                      onClick={() => setShowDelete(false)}
                    />
                    <Button
                      background="error"
                      label="Delete Resource"
                      onClick={async () => {
                        const deleteResourceRequest = await api.resource.delete(
                          resource.id,
                          token
                        )
                        if (deleteResourceRequest.isOk) {
                          if (onChange) onChange()
                        } else {
                          addAlert('Unable to delete resource', 'error')
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </>
          </Modal>
        </>
      )}
    </Box>
  )
}

export const ManageResourceCard = ({
  resource,
  options = [],
  moreOptions = [],
  onChange
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
      onChange={onChange}
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
            onChange={onChange}
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
        {!resource.is_archived && (
          <>
            <Box
              background="brand"
              round
              width="8px"
              height="8px"
              margin="small"
            />
            <Text>Publicly Available</Text>
          </>
        )}
      </Box>
    </Box>
  )
}

export default ManageResourceCard
