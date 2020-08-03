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
import Login from './Login'
import LoginModal from './LoginModal'

import theme from '../theme'

storiesOf('Login', module).add('primary', () => {
    const [showing, setShowing] = React.useState(false)
    return (
      <Grommet theme={theme}>
        <Box pad="small">
            <Login onClick={() => setShowing(true)}/>
            <LoginModal showing={showing} setShowing={setShowing}/>
        </Box>
      </Grommet>
    )
  })
