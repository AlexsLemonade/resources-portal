import React from 'react'
import { Anchor, Box, Button, Text } from 'grommet'
import ResourceLink from 'components/ResourceLink'
import AssignRequestSelect from 'components/AssignRequestSelect'
import { ResourceTypeOrganisms } from 'components/resources/ResourceCard'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request, isRequester } = useRequest()
  const {
    status,
    material: {
      contact_user: { email: contactEmail }
    }
  } = request

  const canContactSteps = ['OPEN', 'APPROVED', 'IN_FULFILLMENT']
  const canContact = isRequester && canContactSteps.includes(status)
  // TODO: when we figure out how requests from the same org should work
  // we should revisit this
  const canAssign = !isRequester

  return (
    <Box
      direction="row"
      align="center"
      justify="between"
      pad={{ bottom: 'medium' }}
      margin={{ bottom: 'large' }}
    >
      <Box gap="medium">
        <ResourceLink resource={request.material} />
        <Anchor
          margin={{ vertical: 'medium' }}
          href={`mailto:${request.requester.email}`}
          label={request.requester.full_name}
        />
        <ResourceTypeOrganisms resource={request.material} />
      </Box>
      <Box>
        {canContact && (
          <Button
            as="a"
            label="Contact Submitter"
            href={`mailto:${contactEmail}`}
            margin={{ bottom: 'small' }}
          />
        )}
        {canAssign && <AssignRequestSelect request={request} />}
        <Text italic color="black-tint-40" textAlign="center">
          {request.human_readable_created_at}
        </Text>
      </Box>
    </Box>
  )
}
