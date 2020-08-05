import * as React from 'react'
import { storiesOf } from '@storybook/react'
import {
  Grommet,
  Anchor,
  Box,
  Button,
  Tabs,
  Tab,
  Text,
  Paragraph,
  FormField,
  Select,
  TextInput,
  RadioButton,
  RadioButtonGroup,
  CheckBox,
  Heading
} from 'grommet'
import Link from 'next/link'
import styled from 'styled-components'
import ORCIDLogo from '../images/grant.svg'
import { ProgressBar } from './ProgressBar'

export const useAlertsQueue = (queue = 'main') => {
  const context = React.useContext(AlertsContext)

  const [alerts, setAlerts] = React.useState(context.alerts)
}

export const CreateAccountStep = ({ORCID}) => {
    return (
    <Box>
        <Text>
            You can use your BioResources portal account to request resources, track requests, and share your own resources.
        </Text>
        <Text>
            Use your existing ORCID iD to create a Bio Resources Portal account. If you do not have an ORCID iD, you can use the button below to create one.
        </Text>
        <Box align='center' width='large' alignSelf='center' margin={{top:'large'}} border={[{ size: 'small', side: 'bottom', color: '#F2F2F2' }]}>
            <Text>
                Our records show that your ORCID iD is {ORCID}
            </Text>
            <Box align="center" pad="medium" gap="large">
                <Button label="Sign in with ORCID iD" icon={<ORCIDLogo />} primary/>
            </Box>
        </Box>
        <Box margin={{bottom:'large'}}>
            <Text weight='bold' margin={{top:'large'}}>
                What is an ORCID iD?
            </Text>
            <Text margin={{top:'small'}}>
                ORCID provides a persistent identifier – an ORCID iD – that distinguishes you from other researchers and links your research outputs and activities to your iD.
            </Text>
            <Anchor color="#017FA3" href="https://orcid.org/" label="Learn more at orcid.org" />
        </Box>
    </Box>
    )
}

export const VerifyGrantStep = () => {
    return (
    <Box>
        <Text>
            TODO Verify grant step goes here.
        </Text>
    </Box>
    )
}

export const NextStepsStep = () => {
    return (
    <Box>
        <Text>
            TODO Next steps go here.
        </Text>
    </Box>
    )
}
