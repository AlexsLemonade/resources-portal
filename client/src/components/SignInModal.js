import { Box, Heading } from 'grommet'
import * as React from 'react'
import {
  AccountCreationInfo,
  Modal,
  ORCIDDescription,
  ORCIDSignInButton
} from './Modal'

export const SignInModalContent = () => {
  return (
    <Box>
      <Box
        fill="horizontal"
        border={[{ size: 'small', side: 'bottom', color: 'black-tint-95' }]}
        height={{ min: '50px' }}
      >
        <Heading serif margin={{ top: 'none', bottom: 'small' }} level="5">
          Create a BioResources Portal Account
        </Heading>
      </Box>
      <Box margin={{ top: 'large', bottom: 'small' }} height="240px">
        <AccountCreationInfo
          button={<ORCIDSignInButton label="Create or Connect ORCID iD" />}
        />
      </Box>
      <Box
        alignSelf="center"
        height="0px"
        width="large"
        border={[{ size: 'small', side: 'top', color: 'black-tint-95' }]}
      />
      <ORCIDDescription />
    </Box>
  )
}

export const SignInModal = ({ showing, setShowing }) => {
  return (
    <Modal
      showing={showing}
      setShowing={setShowing}
      content={<SignInModalContent />}
    />
  )
}

export default SignInModal
