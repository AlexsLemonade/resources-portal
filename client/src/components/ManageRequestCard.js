import React from 'react'
import { Anchor, Box, Button, Text } from 'grommet'
import Link from 'next/link'
import Icon from 'components/Icon'
import { useUser } from 'hooks/useUser'

const getRequestConfig = (request, user) => {
  const isRequester = user.id === request.requester.id
  const assignedToYou = user.id === request.assigned_to.id
  const needsMTA = !!request.material.mta_attachment
  const hasSigned = !!request.requester_signed_mta_attachment
  const hasExecuted = !!request.executed_mta_attachment
  const config = { width: '100%', textColor: 'black' }

  switch (request.status) {
    case 'OPEN':
      config.color = 'brand'
      config.textColor = 'white'
      config.width = '20%'
      config.status = 'Open'
      break
    case 'APPROVED':
      if (needsMTA && hasSigned && !hasExecuted) {
        config.status = 'Awaiting MTA'
        // awaiting mta
      } else {
        config.status = 'Awaiting Additional Documents'
      }
      break
    case 'IN_FULFILLMENT':
      config.color = ''
      config.width = ''
      break
    default:
      break
  }

  return { ...config, isRequester, assignedToYou }
}

export default ({ request }) => {
  console.log(request)
  const { user } = useUser()
  const config = getRequestConfig(request, user)
  // get members for assigned from the user orgs that match the request material org

  return (
    <Box elevation="medium">
      <Box width="full" height="24px">
        <Box height="24px" width={config.width} color={config.color}>
          <Text color={config.textColor}>{config.status}</Text>
        </Box>
      </Box>
      <Box direction="row">
        <Box>
          <Link href={`/resources/${request.material.id}`}>
            <Text>{request.material.title}</Text>
          </Link>
          <Anchor
            href={`mailto:${request.requester.email}`}
            label={request.requester.full_name}
          />
          type orgs
        </Box>
        <Box>
          {!config.isRequester && <>{request.material.organization.title}</>}
          {config.isRequester && (
            <>
              <Text>Resource Contact</Text>
              <Anchor
                href={`mailto:${request.material.contact_user.email}`}
                label={request.material.contact_user.full_name}
              />
            </>
          )}
        </Box>
        <Box>
          <Button primary label="View Request" />
        </Box>
      </Box>
    </Box>
  )
}
