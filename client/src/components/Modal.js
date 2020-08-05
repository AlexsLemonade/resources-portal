import {
    Anchor,
    Box,
    Button,
    Heading, Layer,
    Text
} from 'grommet'
import * as React from 'react'
import Cross from '../images/cross-black-tint-30.svg'
import ORCIDLogo from '../images/grant.svg'

let ORCIDDescription = () => {
    return(
        <Box height={{min:'170px', max:'170px'}}>
            <Box margin={{ top: 'large', bottom: 'small' }}>
                <Text weight='bold'>
                    What is an ORCID iD?
                </Text>
            </Box>
            <Box>
                <Text margin={{ top: 'small', bottom: 'none' }}>
                    ORCID provides a persistent identifier – an ORCID iD – that distinguishes you from other researchers and a mechanism for linking your research outputs and activities to your iD.
                </Text>
                <Anchor color="#017FA3" href="https://orcid.org/" label="Learn more at orcid.org" />
            </Box>
        </Box>
    )
}

let AccountCreationInfo = ({button}) => {
    return (
        <Box height='large' pad='small'>
            <Text weight='bold'>
                Create a BioResources Portal account with your ORCID iD
            </Text>
            <Text margin={{ top: 'small'}}>
                You can use your existing ORCID iD to create an BioResources Portal account. If you don’t have an ORCID iD, you can use the button below to create one!
            </Text>
            <Text margin={{ top: 'small'}}>
            You can use your BioResources Portal account to request resources, share your resources, and track and manage requests.
            </Text>
            {button}
        </Box>
    )
}

let ResourcesButton = () => {
    return (
        <Box alignSelf='center' pad="medium" margin={{ top: 'small'}} width={{min:'320px', max:'320px'}}>
            <Button label="Create or Connect ORCID iD" icon={<ORCIDLogo />} primary/>
        </Box>
    )
}

export const HeaderModalContent = () => {
    return (
        <Box>
            <Box fill='horizontal' border={[{ size: 'small', side: 'bottom', color: '#F2F2F2' }]} height={{min:'50px'}}>
                <Heading serif margin={{ top: 'none', bottom: 'small' }} level='5'>
                    Create a BioResources Portal Account
                </Heading>
            </Box>
            <Box margin={{ top: 'large', bottom: 'small' }} height={{ min: '230px', max:'250px'}}>
                <AccountCreationInfo button={<ResourcesButton/>}/>
            </Box>
            <Box alignSelf='center' height='0px' width='large' border={[{ size: 'small', side: 'top', color: '#F2F2F2' }]}/>
            <ORCIDDescription/>
        </Box>
    )
}


export const ResourcesModalContent = ({title}) => {
    return (
        <Box>
            <Box fill='horizontal' border={[{ size: 'small', side: 'bottom', color: '#F2F2F2' }]} height={{ min: '50px', max:'70px'}}>
                <Heading serif margin={{ top: 'none', bottom: 'small' }} level='5'>
                    {title}
                </Heading>
            </Box>
            <Box direction='row' margin={{ top: 'large'}} height={{ min: '300px', max:'300px'}}>
                <Box basis='2/5' align='center' width={{min:'300px'}} border={[{ size: 'small', side: 'right', color: '#F2F2F2' }]}>
                    <Text weight='bold'>
                        Sign in with your ORCID iD
                    </Text>
                    <Box align='center' margin={{ top: 'large'}}>
                        <Button label="Sign in with ORCID iD" icon={<ORCIDLogo />} primary/>
                    </Box>
                </Box>
                <Box margin={{ left: '30px'}} basis='3/5'>
                    <AccountCreationInfo button={<ResourcesButton/>}/>
                </Box>
            </Box>
            <Box alignSelf='center' height='0px' width='large' margin={{ top: 'large'}} border={[{ size: 'small', side: 'top', color: '#F2F2F2' }]}/>
            <ORCIDDescription/>
        </Box>
    )
}

let Modal = ({showing, setShowing, content}) => {
    return (
        <Box>
          {showing && (
            <Layer
              onEsc={() => setShowing(false)}
              onClickOutside={() => setShowing(false)}
            >
                <Box
                    pad="none"
                    gap='none'
                    align="center"
                    border={[{color: 'black-tint-95' }]}
                    background='white'
                >
                    <Box alignSelf='end'>
                        <Button icon={<Cross />} onClick={() => setShowing(false)} alignSelf='start'/>
                    </Box>
                    <Box fill={true} pad='medium'>
                        {content}
                    </Box>
                </Box>

            </Layer>
          )}
        </Box>
      );
  }

export default Modal
