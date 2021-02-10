import React from 'react'
import { Text } from 'grommet'
import { InfoCard } from 'components/InfoCard'
import ReportIssueToGrantsTeam from 'components/ReportIssueToGrantsTeam'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request, isRequester } = useRequest()
  const {
    requires_action_requester: requiresActionRequester,
    requires_action_sharer: requiresActionSharer
  } = request

  if (isRequester && requiresActionSharer)
    return (
      <InfoCard>
        <Text>
          Still havent heard from {request.material.organization.name}?{' '}
          <ReportIssueToGrantsTeam
            plain
            buttonLabel="Escalate to ALSF Grants Team"
            modalTitle="Report Request to ALSF Grants Team"
            request={request}
          />
        </Text>
      </InfoCard>
    )

  if (isRequester && requiresActionRequester)
    return (
      <InfoCard type="Warning">
        <Text>
          Are you still interested in this resource? Please fill out the
          required information.
        </Text>
      </InfoCard>
    )

  // sharer doesnt need a warning if the requester has not responded
  if (requiresActionRequester) return null

  return (
    <InfoCard type="Warning">
      <Text>
        This resource was requested {request.human_readable_created_at}.
      </Text>
    </InfoCard>
  )
}
