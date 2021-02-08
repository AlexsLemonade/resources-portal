import React from 'react'
import { Anchor, Text } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import useRequest from 'hooks/useRequest'

export default () => {
  const {
    isRequester,
    request: {
      payment_method: paymentMethod,
      requester,
      material: { contact_user: contactUser }
    }
  } = useRequest()

  const reachOutTo = isRequester ? contactUser : requester

  return (
    <Text>
      Please reach out to{' '}
      <Anchor
        label={reachOutTo.full_name}
        href={`mailto:${reachOutTo.email}`}
      />{' '}
      to make arrangements for {getReadable(paymentMethod).toLowerCase()}.
    </Text>
  )
}
