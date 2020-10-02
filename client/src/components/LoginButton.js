import { Box, Button } from 'grommet'
import * as React from 'react'
import Icon from 'components/Icon'

export const LoginButton = ({ onClick, label = 'Sign in with ORCID iD' }) => {
  return (
    <Box align="center" pad="small" gap="large">
      <Button
        label={label}
        icon={<Icon name="ORCID" size="17px" />}
        onClick={onClick}
        login
      />
    </Box>
  )
}

export default LoginButton
