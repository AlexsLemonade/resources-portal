import { storiesOf } from '@storybook/react'
import { Grommet } from 'grommet'
import * as React from 'react'
import theme from '../theme'
import { LoginButton } from './LoginButton'
import Modal, { HeaderModalContent, ResourcesModalContent } from './Modal'

storiesOf('Modal', module).add('Sign in from header', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <LoginButton onClick={() => setShowing(true)} />
      <Modal
        showing={showing}
        setShowing={setShowing}
        content={<HeaderModalContent />}
      />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from search', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <LoginButton onClick={() => setShowing(true)} />
      <Modal
        showing={showing}
        setShowing={setShowing}
        content={<ResourcesModalContent title="Sign In / Create Account" />}
      />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from resource request', () => {
  const [showing, setShowing] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <LoginButton onClick={() => setShowing(true)} />
      <Modal
        showing={showing}
        setShowing={setShowing}
        content={
          <ResourcesModalContent title="Please sign in to contact submitter" />
        }
      />
    </Grommet>
  )
})
