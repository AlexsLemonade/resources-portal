import { Anchor, Box, Button, Layer, Text } from 'grommet'
import * as React from 'react'
import Cross from '../images/cross-black-tint-30.svg'
import ORCIDLogo from '../images/grant.svg'

export const ORCIDDescription = () => {
  return (
    <Box height="170px">
      <Box margin={{ top: 'large', bottom: 'small' }}>
        <Text weight="bold">What is an ORCID iD?</Text>
      </Box>
      <Box>
        <Text margin={{ top: 'small', bottom: 'none' }}>
          ORCID provides a persistent identifier – an ORCID iD – that
          distinguishes you from other researchers and a mechanism for linking
          your research outputs and activities to your iD.
        </Text>
        <Anchor
          color="#017FA3"
          href="https://orcid.org/"
          label="Learn more at orcid.org"
        />
      </Box>
    </Box>
  )
}

export const AccountCreationInfo = ({ button }) => {
  return (
    <Box height="large" pad="small">
      <Text weight="bold">
        Create a BioResources Portal account with your ORCID iD
      </Text>
      <Text margin={{ top: 'small' }}>
        You can use your existing ORCID iD to create an BioResources Portal
        account. If you don’t have an ORCID iD, you can use the button below to
        create one!
      </Text>
      <Text margin={{ top: 'small' }}>
        You can use your BioResources Portal account to request resources, share
        your resources, and track and manage requests.
      </Text>
      {button}
    </Box>
  )
}

export const ResourcesButton = (link) => {
  return (
    <Box
      alignSelf="center"
      pad="medium"
      margin={{ top: 'small' }}
      width="320px"
    >
      <Button
        label="Create or Connect ORCID iD"
        href="https://sandbox.orcid.org/oauth/authorize?client_id=APP-2AHZAK2XCFGHRJFM&response_type=code&scope=/authenticate&redirect_uri=http://localhost:7000/?json=%7B%22email%22:%20%22test@test.com%22%7D"
        icon={<ORCIDLogo />}
        primary
      />
    </Box>
  )
}

export const Modal = ({ showing, setShowing, content }) => {
  return (
    <Box>
      {showing && (
        <Layer
          onEsc={() => setShowing(false)}
          onClickOutside={() => setShowing(false)}
        >
          <Box
            pad="none"
            gap="none"
            align="center"
            border={[{ color: 'black-tint-95' }]}
            background="white"
          >
            <Box alignSelf="end">
              <Button
                icon={<Cross />}
                onClick={() => setShowing(false)}
                alignSelf="start"
              />
            </Box>
            <Box fill pad="medium">
              {content}
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  )
}

export default Modal
