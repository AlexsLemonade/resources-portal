import { storiesOf } from '@storybook/react'
import { Grommet } from 'grommet'
import * as React from 'react'
import theme from '../theme'
import { CreateAccountLoginButton } from './CreateAccountLoginButton'
import { LoginButton } from './LoginButton'
import { IncorrectGrantModal } from './modals/IncorrectGrantModal'

storiesOf('Modal', module).add('Sign in from header', () => {
  return (
    <Grommet theme={theme}>
      <CreateAccountLoginButton
        title="Create a BioResources Portal Account"
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
      <LoginButton onClick={() => setShowing(true)} />
      <IncorrectGrantModal showing={showing} setShowing={setShowing} />
    </Grommet>
  )
})
