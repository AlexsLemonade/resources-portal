import * as React from 'react'
import { storiesOf } from '@storybook/react'
import {
  Grommet,
  Box,
  Button,
  Tabs,
  Tab,
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

export const Login = ({onClick}) => {
    return (
        <Box align="center" pad="small" gap="large">
            <Button label="Sign in with ORCID iD" icon={<ORCIDLogo />} onClick={onClick} login/>
        </Box>
    )
}

export default Login
