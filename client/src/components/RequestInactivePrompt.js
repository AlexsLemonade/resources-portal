import React from 'react'
import { Text } from 'grommet'
import { InfoCard } from 'components/InfoCard'
import ReportIssueToGrantsTeam from 'components/ReportIssueToGrantsTeam'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request, isRequester } = useRequest()
  const {
    is_active_requester: isActiveRequester,
    is_active_sharer: isActiveSharer
  } = request

  // this is the first match becuase when in_fullfillment
  // both sharer and reqester are considered active
  if (isRequester && isActiveSharer)
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

  if (isRequester && isActiveRequester)
    return (
      <InfoCard type="Warning">
        <Text>
          Are you still interested in this resource? Please fill out the
          required information.
        </Text>
      </InfoCard>
    )

  return (
    <InfoCard type="Warning">
      <Text>
        This resource was requested {request.human_readable_created_at}.
      </Text>
    </InfoCard>
  )
}
