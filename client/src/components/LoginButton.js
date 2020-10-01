import { Box, Button } from 'grommet'
import * as React from 'react'
import ORCIDLogo from '../images/grant.svg'

export const LoginButton = ({ onClick, label = 'Sign in with ORCID iD' }) => {
  return (
    <Box align="center" pad="small" gap="large">
      <Button label={label} icon={<ORCIDLogo />} onClick={onClick} login />
    </Box>
  )
}

export default LoginButton
