import { storiesOf } from '@storybook/react'
import { Grommet } from 'grommet'
import * as React from 'react'
import theme from '../theme'
import { CreateOrLoginModal } from './CreateOrLogin'

storiesOf('Modal', module).add('Sign in from header', () => {
  return (
    <Grommet theme={theme}>
      <CreateOrLoginModal title="Create a BioResources Portal Account" />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from search', () => {
  return (
    <Grommet theme={theme}>
      <CreateOrLoginModal
        title="Sign In / Create Account"
        includeSignInSection
      />
    </Grommet>
  )
})

storiesOf('Modal', module).add('Sign in from resource request', () => {
  return (
    <Grommet theme={theme}>
      <CreateOrLoginModal
        title="Please sign in to contact submitter"
        includeSignInSection
      />
    </Grommet>
  )
})
