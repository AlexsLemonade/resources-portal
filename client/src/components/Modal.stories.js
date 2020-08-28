import { storiesOf } from '@storybook/react'
import { Grommet } from 'grommet'
import * as React from 'react'
import theme from '../theme'
import { LoginButton } from './LoginButton'
import CreateAccountModal from './modals/CreateAccountModal'
import { IncorrectGrantModal } from './modals/IncorrectGrantModal'
import { SignInModal } from './modals/SignInModal'

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

storiesOf('Modal', module).add('Incorrect grant', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <LoginButton onClick={() => setShowing(true)} />
      <IncorrectGrantModal showing={showing} setShowing={setShowing} />
    </Grommet>
  )
})
