import React from 'react'
import { Box, Button, DropButton, Text, Anchor } from 'grommet'
import Link from 'components/Link'
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
  onModalOpen = () => {},
  setShowArchive,
  setShowDelete
}) => {
  const manageLink = `/account/manage-resources/${resource.id}`
  const editLink = `/resources/${resource.id}/edit`
  const viewResourceLink = `/resources/${resource.id}`
  const archiveButtonLabel = resource.is_archived ? 'Unarchive' : 'Archive'

  return (
    <Box direction={direction} gap="medium" pad={pad}>
      {options.includes('manage') && (
        <Link
          icon={<Icon name="Gear" size="small" />}
          label="Manage Resource"
          href={manageLink}
        />
      )}
      {options.includes('edit') && (
        <Link
          icon={<Icon name="Edit" size="small" />}
          label="Edit"
          href={editLink}
        />
      )}
      {options.includes('view') && (
        <Link
          icon={<Icon name="View" size="12px" />}
          label="View Resource"
          href={viewResourceLink}
        />
      )}
      {options.includes('archive') && (
        <>
          <Anchor
            icon={<Icon name="Archive" size="small" />}
            label={archiveButtonLabel}
            onClick={() => {
              setShowArchive(true)
              onModalOpen()
            }}
          />
        </>
      )}
      {options.includes('delete') && (
        <Anchor
          icon={<Icon name="Trashcan" size="small" color="error" />}
          color="error"
          label="Delete"
          onClick={() => {
            setShowDelete(true)
            onModalOpen()
          }}
          disabled={openRequests > 0}
        />
      )}
    </Box>
  )
}

export const ManageResourceCard = ({
  resource,
  options = [],
  moreOptions = [],
  onChange = () => {}
}) => {
  const { token, getTeam, isPersonalResource } = useUser()
  const requestsLink = `/account/manage-resources/${resource.id}?scroll=open-requests`
  const team = getTeam(resource.organization)
  const teamLink = `/account/teams/${team.id}`

  const [openRequests, setOpenRequests] = React.useState()
  const [dropOpen, setDropOpen] = React.useState(false)

  const { addAlert } = useAlertsQueue()
  const [showDelete, setShowDelete] = React.useState(false)
  const [showArchive, setShowArchive] = React.useState(false)
  const archiveButtonLabel = resource.is_archived
    ? 'Unarchive Resource'
    : 'Archive Resource'
  const archivedMessage = resource.is_archived
    ? 'Resource Unarchived'
    : 'Resource Archived'
  const archivedStatus = resource.is_archived
    ? 'Archived'
    : 'Publicly Available'

  React.useState(() => {
    const fetchRequests = async () => {
      const request = await api.resources.requests.filter(
        resource.id,
        { limit: 1000 },
        token
      )
      if (request.isOk) {
        const nonArchivableRequests = request.response.results.filter((r) => {
          return !['FULFILLED', 'VERIFIED_FULFILLED'].includes(r.status)
        })
        setOpenRequests(nonArchivableRequests.length)
      }
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
      onModalOpen={() => setDropOpen(false)}
      setShowDelete={setShowDelete}
      setShowArchive={setShowArchive}
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
              open={dropOpen}
              onOpen={() => setDropOpen(true)}
              onClose={() => setDropOpen(false)}
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
            <Link href={teamLink} label={team.name} />
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
          <Link href={requestsLink} label={`${openRequests} Open Requests`} />
        ) : (
          <Text>0 Open Requests</Text>
        )}
        <>
          <Box
            background="brand"
            round
            width="8px"
            height="8px"
            margin="small"
          />
          <Text italic={resource.is_archived}>{archivedStatus}</Text>
        </>
      </Box>
      <Modal
        title="Archive Resource"
        showing={showArchive}
        setShowing={setShowArchive}
      >
        <>
          {openRequests === 0 && (
            <Box>
              <Box direction="row">
                <Icon name="Warning" color="warning" />
                {resource.is_archived ? (
                  <Text>
                    Are you sure you want to un-archive this resource?
                  </Text>
                ) : (
                  <Text>Are you sure you want to archive this resource?</Text>
                )}
              </Box>
              <Box>
                <Text>
                  Researchers will not be able to request for this resource but
                  they will still be able to review it.
                </Text>
              </Box>
              <Box direction="row" pad="medium" justify="end" gap="medium">
                <Button label="Cancel" onClick={() => setShowArchive(false)} />
                <Button
                  primary
                  label={archiveButtonLabel}
                  onClick={async () => {
                    const archiveRequest = await api.resources.update(
                      resource.id,
                      { ...resource, is_archived: !resource.is_archived },
                      token
                    )
                    if (archiveRequest.isOk) {
                      onChange()
                      addAlert(archivedMessage, 'success')
                      setShowArchive(false)
                    } else {
                      addAlert('Unable to archive resource', 'error')
                    }
                  }}
                />
              </Box>
            </Box>
          )}
          {openRequests !== 0 && (
            <Box width="medium">
              <Box direction="row" margin={{ vertical: 'medium' }}>
                <Icon name="Warning" color="warning" />
                <Text>Cannot archive resource with open requests.</Text>
              </Box>
              <Box margin={{ vertical: 'medium' }}>
                <Text>
                  Your resource has{' '}
                  <Link
                    href={requestsLink}
                    label={`${openRequests} open requests`}
                  />
                  {'. '}
                  Please accept or reject those requests before archiving this
                  resource.
                </Text>
              </Box>
              <Box>
                <Link href={requestsLink} as="a" label="Show Requests" />
              </Box>
              <Box direction="row" justify="end">
                <Button label="Close" onClick={() => setShowArchive(false)} />
              </Box>
            </Box>
          )}
        </>
      </Modal>

      <Modal showing={showDelete} setShowing={setShowDelete}>
        <Box>
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
              <Box direction="row" pad="medium" justify="end" gap="medium">
                <Button label="Cancel" onClick={() => setShowDelete(false)} />
                <Button
                  critical
                  label="Delete Resource"
                  onClick={async () => {
                    const deleteRequest = await api.resources.delete(
                      resource.id,
                      token
                    )
                    if (deleteRequest.isOk) {
                      if (onChange) onChange()
                      addAlert('Resource Deleted', 'success')
                      setShowDelete(false)
                    } else {
                      addAlert('Unable to delete resource', 'error')
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default ManageResourceCard
