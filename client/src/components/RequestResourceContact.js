import React from 'react'
import { Anchor, Box, Button, Text } from 'grommet'
import ResourceLink from 'components/ResourceLink'
import { ResourceTypeOrganisms } from 'components/resources/ResourceCard'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request } = useRequest()
  const {
    status,
    material: {
      contact_user: { email: contactEmail }
    }
  } = request

  const canContact = !['FULFILLED', 'VERIFIED_FULFILLED'].includes(status)

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
        <Text italic color="black-tint-40" textAlign="center">
          {request.human_readable_created_at}
        </Text>
      </Box>
    </Box>
  )
}
