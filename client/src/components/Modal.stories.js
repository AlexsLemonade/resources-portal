import { storiesOf } from '@storybook/react'
import { Grommet } from 'grommet'
import * as React from 'react'
import theme from '../theme'
import { CreateOrLoginButton } from './CreateOrLogin'

storiesOf('Modal', module).add('Sign in from header', () => {
  return (
    <Grommet theme={theme}>
      <CreateOrLoginButton title="Create a BioResources Portal Account" />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from search', () => {
  return (
    <Grommet theme={theme}>
      <CreateOrLoginButton
        title="Sign In / Create Account"
        includeSignInSection
      />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from resource request', () => {
  return (
    <Grommet theme={theme}>
      <CreateOrLoginButton
        title="Please sign in to contact submitter"
        includeSignInSection
      />
    </Grommet>
  )
})
