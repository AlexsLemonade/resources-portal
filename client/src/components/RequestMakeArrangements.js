import React from 'react'
import { Anchor, Text } from 'grommet'
import { getReadable } from 'helpers/readableNames'

export default ({ request, requesterView = false }) => {
  const {
    requester,
    material: { contact_user: contactUser }
  } = request

  const reachOutTo = requesterView ? contactUser : requester

  return (
    <Text>
      Please reach out to{' '}
      <Anchor
        label={reachOutTo.full_name}
        href={`mailto:${reachOutTo.email}`}
      />{' '}
      to make arrangements for{' '}
      {getReadable(request.payment_method).toLowerCase()}.
    </Text>
  )
}
