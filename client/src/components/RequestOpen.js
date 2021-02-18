import React from 'react'
import { Box, Button, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import Icon from 'components/Icon'
import PreviewAbstract from 'components/PreviewAbstract'
import PreviewAddress from 'components/PreviewAddress'
import RequestReject from 'components/RequestReject'
import useRequest from 'hooks/useRequest'
import getRequesterWillBeAskedToProvide from 'helpers/getRequesterWillBeAskedToProvide'

export default () => {
  const { request, isRequester, updateStatus } = useRequest()
  const {
    address,
    is_missing_requester_documents: isMissingDocs,
    requester_abstract: abstract,
    material: {
      organization: { name: teamName }
    }
  } = request

  const acceptRequest = () => {
    const status = isMissingDocs ? 'APPROVED' : 'IN_FULFILLMENT'
    updateStatus(status)
  }

  if (isRequester)
    return (
      <Box pad={{ veritcal: 'large' }}>
        <Text margin={{ left: 'large', bottom: 'medium' }}>
          Awaiting decision from {teamName}.
        </Text>
        <HeaderRow label="Submitted Materials" />
        {request.requester_abstract && (
          <PreviewAbstract abstract={request.requester_abstract} />
        )}
        {request.address && <PreviewAddress address={request.address} />}
      </Box>
    )

  return (
    <Box pad={{ bottom: 'large' }}>
      <Text margin={{ left: 'large', bottom: 'medium' }}>
        Please review any materials supplied by the requester and make a
        decision.
      </Text>
      <HeaderRow label="Requester Submitted Materials" />
      {!request.requester_abstract && !request.address && (
        <Text color="black-tint-60" italic>
          No submitted materials required.
        </Text>
      )}
      {abstract && <PreviewAbstract abstract={abstract} />}
      {address && <PreviewAddress address={address} />}
      <Box
        direction="row"
        gap="medium"
        justify="end"
        margin={{ bottom: 'medium' }}
      >
        <RequestReject />
        <Button primary label="Accept" onClick={acceptRequest} />
      </Box>
      {request.is_missing_requester_documents && (
        <Box margin={{ bottom: 'medium' }} width="medium" alignSelf="center">
          <Box direction="row" gap="medium" margin={{ top: 'large' }}>
            <Icon name="Info" />
            <Text weight="bold">
              Requester will be asked to provide{' '}
              {getRequesterWillBeAskedToProvide(request)} once you accept.
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
