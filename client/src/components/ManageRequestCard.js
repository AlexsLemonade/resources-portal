import React from 'react'
import { Anchor, Box, Button, Text } from 'grommet'
import styled from 'styled-components'
import Link from 'next/link'
import Icon from 'components/Icon'
import { ResourceTypeOrganisms } from 'components/resources/ResourceCard'
import { Pill } from 'components/Pill'
import AssignRequestSelect from 'components/AssignRequestSelect'
import { useUser } from 'hooks/useUser'
import getRequestStatus from 'helpers/getRequestStatus'
import { getReadable } from 'helpers/readableNames'

const getRequestConfig = (request) => {
  const status = getRequestStatus(request)
  const title = getReadable(status)
  const config = {
    title,
    status,
    barRound: { size: 'medium', corner: 'right' }
  }

  switch (status) {
    case 'OPEN':
      config.barColor = 'brand'
      config.barTextColor = 'white'
      config.barWidth = '10%'
      break
    case 'AWAITING_ADDITIONAL_DOCUMENTS':
      config.barColor = 'turteal-tint-60'
      config.barTextColor = 'black'
      config.barWidth = '35%'
      break
    case 'AWAITING_MTA':
      config.barColor = 'soda-orange-tint-60'
      config.barTextColor = 'black'
      config.barWidth = '50%'
      break
    case 'IN_FULFILLMENT':
      config.barColor = 'savana-green-tint-40'
      config.barTextColor = 'black'
      config.barWidth = '80%'
      break
    case 'IN_FULFILLMENT_ISSUE_REPORTED':
      config.barColor = 'savana-green-tint-40'
      config.barTextColor = 'black'
      config.barWidth = '80%'
      config.icon = 'Warning'
      break
    case 'FULFILLED':
      config.barColor = 'success'
      config.barTextColor = 'white'
      config.barWidth = '100%'
      config.barRound = false
      break
    case 'VERIFIED_FULFILLED':
      config.barColor = 'success'
      config.barTextColor = 'white'
      config.barWidth = '100%'
      config.icon = 'Check'
      config.barRound = false
      break
    case 'CANCELLED':
      config.barColor = 'error'
      config.barTextColor = 'white'
      config.barWidth = '100%'
      config.barRound = false
      break
    case 'CLOSED':
    case 'REJECTED':
    case 'INVALID':
    default:
      // closed rejected invalid
      config.barColor = 'border-black'
      config.background = 'black-tint-95'
      config.barWidth = '100%'
      config.barRound = false
      break
  }

  return config
}

const BoldAnchor = styled(Anchor)`
  font-weight: bold;
`
export default ({ request: defaultRequest }) => {
  const [request, setRequest] = React.useState(defaultRequest)
  const { isResourceRequester } = useUser()
  const config = getRequestConfig(request)
  const isRequester = isResourceRequester(request)

  const showSharerWaiting =
    !isRequester && config.status === 'AWAITING_ADDITIONAL_DOCUMENTS'
  const showRequesterAction =
    isRequester && config.status === 'AWAITING_ADDITIONAL_DOCUMENTS'
  const showActionPill = showSharerWaiting || showRequesterAction
  const pillLabel = showSharerWaiting
    ? 'Waiting on Requester'
    : 'Reuires Action'
  const fallbackDate = new Date(request.created_at).toDateString()
  const resourceLink = `/resources/${request.material.id}`

  return (
    <Box elevation="medium" round="small" overflow="hidden">
      <Box width="full" height="24px" background="black-tint-95">
        <Box
          height="24px"
          width={config.barWidth}
          background={config.barColor}
          pad={{ horizontal: 'small' }}
          round={config.barRound}
          direction="row"
          align="center"
          gap="small"
        >
          {config.icon && (
            <Icon name={config.icon} color={config.barTextColor} size="small" />
          )}
          <Text italic color={config.barTextColor}>
            {config.title}
          </Text>
        </Box>
      </Box>
      <Box direction="row" align="center" pad="medium" justify="between">
        <Box>
          <Link href={resourceLink}>
            <BoldAnchor href={resourceLink} label={request.material.title} />
          </Link>
          <Anchor
            margin={{ vertical: 'medium' }}
            href={`mailto:${request.requester.email}`}
            label={request.requester.full_name}
          />
          <ResourceTypeOrganisms resource={request.material} />
        </Box>
        <Box>
          {!isRequester && (
            <>
              <AssignRequestSelect request={request} onSave={setRequest} />
              <Text>{request.material.organization.title}</Text>
            </>
          )}
          {isRequester && (
            <>
              <Text>Resource Contact</Text>
              <Anchor
                href={`mailto:${request.material.contact_user.email}`}
                label={request.material.contact_user.full_name}
              />
            </>
          )}
        </Box>
        <Box align="end">
          {showActionPill && (
            <Box margin={{ bottom: 'small' }}>
              <Pill
                color="error"
                textColor="black"
                background="soda-orange-tint-80"
                label={pillLabel}
              />
            </Box>
          )}
          <Box align="center">
            <Button
              as="a"
              primary
              label="View Request"
              href={`/account/requests/${request.id}`}
            />
            <Text margin={{ top: 'small' }} color="black-tint-40" italic>
              {request.human_readable_created_at || fallbackDate}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
