import React from 'react'
import { FormField, Select } from 'grommet'
import { useUser } from 'hooks/useUser'
import api from 'api'

export default ({ request, onSave }) => {
  const { token } = useUser()
  const [memberOptions, setMemberOptions] = React.useState()

  React.useEffect(() => {
    const fetchMembers = async () => {
      const teamRequest = await api.teams.get(
        request.material.organization.id,
        token
      )
      if (teamRequest.isOk) {
        const newMemberOptions = teamRequest.response.members.map((m) => ({
          label: `${m.full_name} | ${m.email}`,
          value: m.id
        }))
        setMemberOptions(newMemberOptions)
      }
    }
    if (!memberOptions) fetchMembers()
  })

  const setAssignedTo = async (willAssignTo) => {
    const newAssignmentRequest = await api.requests.update(
      request.id,
      {
        assigned_to: willAssignTo
      },
      token
    )

    if (newAssignmentRequest.isOk) onSave(newAssignmentRequest.response)
  }

  return (
    <FormField label="Assigned To">
      <Select
        labelKey="label"
        valueKey="value"
        value={{ value: request.assigned_to }}
        options={memberOptions || []}
        onChange={({ option }) => setAssignedTo(option.value)}
      />
    </FormField>
  )
}
