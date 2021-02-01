import React from 'react'
import { Box, Text } from 'grommet'
import { getReadable } from 'helpers/readableNames'
import Icon from 'components/Icon'
import useRequest from 'hooks/useRequest'
import getRequestState from 'helpers/getRequestStatus'

export default () => {
  const { request } = useRequest()
  const state = getRequestState(request)

  return (
    <Box direction="row" align="center" gap="small">
      <Text size="large" serif margin={{ bottom: 'medium' }}>
        {state === 'OPEN' ? 'Open Request' : getReadable(state)}
      </Text>
      {state === 'VERIFIED_FULFILLED' && (
        <Text margin={{ top: '-8px' }}>
          <Icon name="Check" color="success" />
        </Text>
      )}
    </Box>
  )
}
