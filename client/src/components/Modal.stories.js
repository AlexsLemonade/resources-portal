import React from 'react'
import { storiesOf } from '@storybook/react'
import { Box, Button, Grommet } from 'grommet'
import theme from 'theme'
import CreateAccountLoginButton from 'components/CreateAccountLoginButton'
import { IncorrectGrantModal } from 'components/modals/IncorrectGrantModal'

storiesOf('Modal', module).add('Sign in from header', () => {
  return (
    <Grommet theme={theme}>
      <CreateAccountLoginButton
        title="Create a CCRR Portal Account"
        showSignIn={false}
      />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from search', () => {
  return (
    <Grommet theme={theme}>
      <CreateAccountLoginButton title="Sign In / Create Account" />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from resource request', () => {
  return (
    <Grommet theme={theme}>
      <CreateAccountLoginButton title="Please sign in to contact submitter" />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Incorrect grant', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <Box align="center" pad="small">
        <Button
          onClick={() => setShowing(true)}
          label="Report missing/incorrect information"
        />
      </Box>
      <IncorrectGrantModal showing={showing} setShowing={setShowing} />
    </Grommet>
  )
})
