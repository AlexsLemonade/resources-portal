import * as React from 'react'
import { storiesOf } from '@storybook/react'
import {
  Grommet,
  Anchor,
  Box,
  Button,
  Layer,
  Tabs,
  Tab,
  Paragraph,
  FormField,
  Select,
  TextInput,
  RadioButton,
  RadioButtonGroup,
  CheckBox,
  Heading,
  Text
} from 'grommet'
import Link from 'next/link'
import styled from 'styled-components'
import ORCIDLogo from '../images/grant.svg'
import Cross from '../images/cross-black-tint-30.svg'

let LoginModal = ({showing, setShowing}) => {
    return (
        <Box>
          {showing && (
            <Layer
              onEsc={() => setShowing(false)}
              onClickOutside={() => setShowing(false)}
            >
                <Box
                    pad="none"
                    width={{ min: '200px', max:'932px'}}
                    height={{ min: '200px', max:'932px'}}
                    gap='none'
                    align="center"
                    border={[{color: 'black-tint-95' }]}
                    background='white'
                >
                    <Box alignSelf='end'>
                        <Button icon={<Cross />} onClick={() => setShowing(false)} alignSelf='start'/>
                    </Box>

                    <Box fill='true' pad='medium'>
                        <Box fill='horizontal' border={[{ size: 'small', side: 'bottom', color: '#F2F2F2' }]} height={{ min: '50px', max:'70px'}}>
                            <Heading serif margin={{ top: 'none', bottom: 'small' }} level="5">
                            Create a BioResources Portal Account
                            </Heading>
                        </Box>
                        <Box margin={{ top: 'large', bottom: 'small' }} height={{ min: '40px', max:'100px'}}>
                            <Text weight='bold'>
                            Create a BioResources Portal account with your ORCID iD
                            </Text>
                        </Box>
                        <Box height={{ min: '120px', max:'200px'}}>
                            <Text margin={{ top: 'small', bottom: 'none' }}>
                            You can use your existing ORCID iD to create an BioResources Portal account. If you don’t have an ORCID iD, you can use the button below to create one!
                            </Text>
                            <Text margin={{ top: 'small', bottom: 'small' }}>
                            You can use your BioResources Portal account to request resources, share your resources, and track and manage requests.
                            </Text>
                        </Box>
                        <Box align='center' alignSelf='center' pad="large" height={{ min: '100px', max:'200px'}} width={{ min: '400px', max:'600px'}} border={[{ size: 'small', side: 'bottom', color: '#F2F2F2' }]}>
                            <Button label="Create or Connect ORCID iD" icon={<ORCIDLogo />} primary/>
                        </Box>
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
                </Box>

            </Layer>
          )}
        </Box>
      );
  }

export default LoginModal
