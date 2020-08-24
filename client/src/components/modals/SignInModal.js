import { Box, Heading } from 'grommet'
import * as React from 'react'
import { Modal } from '../Modal'
import {
  AccountCreationInfo,
  ORCIDDescription,
  ORCIDSignInButton
} from './CommonModalContent'

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
          button={
            // prettier and eslint disagree on what should be done
            // about this line, so I had to disable one of them.
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ORCIDSignInButton
              label="Create or Connect ORCID iD"
              redirectUrl={process.env.CLIENT_HOST}
            />
          }
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
    <Modal showing={showing} setShowing={setShowing}>
      <SignInModalContent />
    </Modal>
  )
}

export default SignInModal
