import React from 'react'
import { Box, Button } from 'grommet'
import Icon from 'components/Icon'
import { useLocalStorage } from 'hooks/useLocalStorage'
import getOrcidUrl from 'helpers/getOrcidUrl'

export default ({ label, redirectPath = '/account' }) => {
  const [, setClientRedirectUrl] = useLocalStorage('clientRedirectUrl')
  const orcidUrl = getOrcidUrl(redirectPath)

  return (
    <Box alignSelf="center" pad="medium" margin={{ top: 'small' }}>
      <Button
        label={label}
        href={orcidUrl}
        icon={<Icon name="ORCID" size="17px" />}
        onClick={() => {
          setClientRedirectUrl(
            window.location.pathname + window.location.search
          )
        }}
        primary
      />
    </Box>
  )
}
