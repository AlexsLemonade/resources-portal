import { storiesOf } from '@storybook/react'
import { Grommet } from 'grommet'
import * as React from 'react'
import theme from '../theme'
import CreateAccountModal from './CreateAccountModal'
import { LoginButton } from './LoginButton'
import SignInModal from './SignInModal'

storiesOf('Modal', module).add('Sign in from header', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <LoginButton onClick={() => setShowing(true)} />
      <SignInModal showing={showing} setShowing={setShowing} />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from search', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <LoginButton onClick={() => setShowing(true)} />
      <CreateAccountModal
        title="Sign In / Create Account"
        showing={showing}
        setShowing={setShowing}
      />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from resource request', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <LoginButton onClick={() => setShowing(true)} />
      <CreateAccountModal
        title="Please sign in to contact submitter"
        showing={showing}
        setShowing={setShowing}
      />
    </Grommet>
  )
})
