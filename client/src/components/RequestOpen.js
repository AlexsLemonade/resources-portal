import React from 'react'
import { Box } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import PreviewAbstract from 'components/PreviewAbstract'
import PreviewAddress from 'components/PreviewAddress'
import useRequest from 'hooks/useRequest'

export default () => {
  const { request } = useRequest()

  return (
    <Box pad={{ veritcal: 'large' }}>
      <HeaderRow label="Submitted Materials" />
      {request.requester_abstract && (
        <PreviewAbstract abstract={request.requester_abstract} />
      )}
      {request.address && <PreviewAddress address={request.address} />}
    </Box>
  )
}
