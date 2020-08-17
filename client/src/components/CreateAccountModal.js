import { Box, Button, Heading, Text } from 'grommet'
import * as React from 'react'
import ORCIDLogo from '../images/grant.svg'
import {
  AccountCreationInfo,
  Modal,
  ORCIDDescription,
  ResourcesButton
} from './Modal'

const CreateAccountModalContent = ({ title }) => {
  return (
    <Box height="550px" width="800px">
      <Box
        fill="horizontal"
        border={[{ size: 'small', side: 'bottom', color: 'black-tint-95' }]}
        height={{ min: '50px', max: '70px' }}
      >
        <Heading serif margin={{ top: 'none', bottom: 'small' }} level="5">
          {title}
        </Heading>
      </Box>
      <Box direction="row" margin={{ top: 'large' }} height="350px">
        <Box
          align="center"
          width={{ min: '400px' }}
          border={[{ size: 'small', side: 'right', color: 'black-tint-95' }]}
        >
          <Text weight="bold">Sign in with your ORCID iD</Text>
          <Box
            align="center"
            margin={{ top: 'medium' }}
            height={{ min: '40px' }}
          >
            <Button
              label="Sign in with ORCID iD"
              icon={<ORCIDLogo />}
              primary
            />
          </Box>
        </Box>
        <Box margin={{ left: '30px' }}>
          <AccountCreationInfo button={<ResourcesButton />} />
        </Box>
      </Box>
      <Box
        alignSelf="center"
        height="0px"
        width="large"
        margin={{ top: 'large' }}
        border={[{ size: 'small', side: 'top', color: 'black-tint-95' }]}
      />
      <ORCIDDescription />
    </Box>
  )
}

const CreateAccountModal = ({ showing, setShowing, title }) => {
  return (
    <Modal
      showing={showing}
      setShowing={setShowing}
      content={<CreateAccountModalContent title={title} />}
    />
  )
}

export default CreateAccountModal
