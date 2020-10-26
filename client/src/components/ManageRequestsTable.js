import React from 'react'
import { Box, FormField, Select, Text } from 'grommet'
import ManageRequestCard from 'components/ManageRequestCard'
import { useUser } from 'hooks/useUser'
import getRequestStatus, { allStatuses } from 'helpers/getRequestStatus'
import { getReadable } from 'helpers/readableNames'
import unique from 'helpers/unique'
import { resourceCategories } from 'components/resources'
import api from 'api'

const RequestFilters = ({
  requests,
  filters = ['status', 'assignedTo', 'resourceType', 'team'],
  onFilterChange
}) => {
  const [fetchedTeams, setFetchedTeams] = React.useState(false)
  const [teamOptions, setTeamOptions] = React.useState([])
  const [memberOptions, setMemberOptions] = React.useState([])
  const resourceTypeOptions = [
    { label: 'All', value: undefined },
    ...resourceCategories.map((value) => ({
      label: getReadable(value),
      value
    }))
  ]
  const statusOptions = [
    { label: 'All', value: undefined },
    ...allStatuses.map((value) => ({
      label: getReadable(value),
      value
    }))
  ]

  const { user, token } = useUser()
  const [status, setStatus] = React.useState()
  const [assignedTo, setAssignedTo] = React.useState()
  const [resourceType, setResourceType] = React.useState()
  const [team, setTeam] = React.useState()

  React.useEffect(() => {
    const fetchTeams = async () => {
      setFetchedTeams(true)
      const teamsRequestsPromises = user.organizations.map((userTeam) =>
        api.teams.get(userTeam.id, token)
      )
      const teamsRequests = await Promise.all(teamsRequestsPromises)

      const newTeams = teamsRequests.map((teamRequest) => {
        if (teamRequest.isOk)
          return {
            label: teamRequest.response.name,
            value: teamRequest.response.id
          }
        return null
      })

      const cleanedNewTeams = newTeams.filter((t) => t !== null)
      setTeamOptions([{ label: 'All', value: undefined }, ...cleanedNewTeams])

      const newMembers = [].concat(
        ...teamsRequests.map((teamRequest) => {
          if (teamRequest.isOk)
            return teamRequest.response.members.map((m) => ({
              label: `${m.full_name} | ${m.email}`,
              value: m.id
            }))
          return []
        })
      )

      const cleanedNewMembers = unique(newMembers, 'value')

      setMemberOptions([
        { label: 'All', value: undefined },
        ...cleanedNewMembers
      ])
    }
    if (!fetchedTeams) fetchTeams()
  })

  React.useEffect(() => {
    const filteredStatus = requests.filter(
      (r) => status === undefined || getRequestStatus(r) === status
    )

    const filteredResourceType = filteredStatus.filter(
      (r) => !resourceType || r.material.category === resourceType
    )

    const filteredAssignedTo = filteredResourceType.filter(
      (r) => !assignedTo || r.assigned_to === assignedTo
    )

    const filteredTeam = filteredAssignedTo.filter(
      (r) => !team || r.material.organization.id === team
    )

    const filteredRequests = [...filteredTeam]

    const cleanedFilteredRequests = unique(filteredRequests, 'id')

    onFilterChange(cleanedFilteredRequests)
  }, [status, assignedTo, resourceType, team])

  return (
    <Box direction="row" gap="small">
      {filters.includes('status') && (
        <FormField label="Status">
          <Select
            labelKey="label"
            valueKey="value"
            options={statusOptions}
            onChange={({ option }) => {
              setStatus(option.value)
            }}
          />
        </FormField>
      )}
      {filters.includes('assignedTo') && (
        <FormField label="Assigned to">
          <Select
            labelKey="label"
            valueKey="value"
            options={memberOptions}
            onChange={({ option }) => {
              setAssignedTo(option.value)
            }}
          />
        </FormField>
      )}
      {filters.includes('resourceType') && (
        <FormField label="Resource Type">
          <Select
            options={resourceTypeOptions}
            labelKey="label"
            valueKey="value"
            onChange={({ option }) => {
              setResourceType(option.value)
            }}
          />
        </FormField>
      )}
      {filters.includes('team') && (
        <FormField label="Team">
          <Select
            labelKey="label"
            valueKey="value"
            options={teamOptions}
            onChange={({ option }) => {
              setTeam(option.value)
            }}
          />
        </FormField>
      )}
    </Box>
  )
}

// default to all filters
export default ({ requests = [], filters }) => {
  const [filteredRequests, setFilteredRequests] = React.useState(requests)

  return (
    <Box>
      <RequestFilters
        requests={requests}
        filters={filters}
        onFilterChange={setFilteredRequests}
      />
      <Box margin={{ vertical: 'medium' }}>
        {filteredRequests.map((request) => (
          <Box key={request.id} margin={{ bottom: 'large' }}>
            <ManageRequestCard request={request} />
          </Box>
        ))}
        {requests.length > 0 && filteredRequests.length === 0 && (
          <Text color="black-tint-60" italic>
            There are no requests that match the current filters
          </Text>
        )}
      </Box>
    </Box>
  )
}
