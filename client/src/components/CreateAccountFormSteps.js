import React from 'react'
import { Anchor, Box, Button, Text } from 'grommet'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { useCreateUser } from 'hooks/useCreateUser'
import Link from 'next/link'
import ORCIDSignInButton from 'components/ORCIDSignInButton'
import { IncorrectGrantModal } from 'components/modals/IncorrectGrantModal'
import CreateAccountDetailsForm from 'components/CreateAccountDetailsForm'
import GrantIcon from '../images/grant-icon.svg'
import NextSteps from '../images/join-by-invite-next-steps.svg'

export const CreateAccountStep = ({ ORCID }) => {
  const { getNextStep } = useCreateUser()
  return (
    <Box>
      <Text>
        You can use your CCRR Portal account to request resources, track
        requests, and share your own resources.
      </Text>
      <Text>
        Use your existing ORCID iD to create a CCRR Portal account. If you do
        not have an ORCID iD, you can use the button below to create one.
      </Text>
      <Box
        align="center"
        width="large"
        alignSelf="center"
        margin={{ top: 'small' }}
        border={[{ size: 'small', side: 'bottom', color: 'black-tint-95' }]}
      >
        <Box>
          {ORCID && (
            <Text>Our records show that your ORCID iD is {ORCID}.</Text>
          )}
        </Box>
        <Box align="center" pad="medium" gap="medium">
          <ORCIDSignInButton
            label="Sign in with ORCID iD"
            redirectPath={`/create-account?stepName=${getNextStep()}`}
          />
        </Box>
      </Box>
      <Box margin={{ bottom: 'large' }}>
        <Text weight="bold" margin={{ top: 'large' }}>
          What is an ORCID iD?
        </Text>
        <Text margin={{ top: 'small' }}>
          ORCID provides a persistent identifier – an ORCID iD – that
          distinguishes you from other researchers and links your research
          outputs and activities to your iD.
        </Text>
        <Anchor
          target="_blank"
          href="https://orcid.org/"
          label="Learn more at orcid.org"
        />
      </Box>
    </Box>
  )
}

export const EnterDetailsStep = () => {
  const { user, stepForward } = useCreateUser()

  if (user) {
    return (
      <Box pad="medium" gap="medium">
        <Text>
          The following email was extracted from your ORCID record: {user.email}
        </Text>
        <Box width="200px" alignSelf="center">
          <Button label="Next" onClick={stepForward} />
        </Box>
      </Box>
    )
  }

  return (
    <Box pad="medium" gap="medium" width={{ min: '400px' }}>
      <CreateAccountDetailsForm
        onSubmit={() => {
          stepForward()
        }}
      />
    </Box>
  )
}

export const VerifyGrantStep = () => {
  const { stepForward, newUser } = useCreateUser()
  const { addAlert } = useAlertsQueue()
  const [showing, setShowing] = React.useState(false)

  return (
    <Box gap="medium">
      <Text weight="bold">Your account has been created!</Text>
      <Text>
        Please take a moment to verify the grants you have received from Alex's
        Lemonade Stand Foundation.
      </Text>
      <Text margin={{ top: 'small' }} weight="bold">
        Grants Received
      </Text>
      <Box gap="medium">
        {newUser.grants.map((grant) => (
          <Box
            key={`${grant.title}-${grant.funder_id}`}
            direction="row"
            align="center"
          >
            <Box pad="small">
              <GrantIcon />
            </Box>
            <Box direction="column">
              <Text>{grant.title}</Text>
              <Text size="small">Grant: {grant.funder_id}</Text>
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        direction="row"
        gap="medium"
        basis="3/4"
        alignSelf="end"
        margin={{ top: 'medium' }}
      >
        <Button
          label="Report missing/incorrect information"
          onClick={() => setShowing(true)}
        />
        <IncorrectGrantModal showing={showing} setShowing={setShowing} />
        <Button
          label="This information is correct"
          onClick={() => {
            addAlert('Your account was created', 'success')
            stepForward()
          }}
          primary
        />
      </Box>
    </Box>
  )
}

export const NextStepsStep = () => {
  return (
    <Box direction="row" gap="xlarge">
      <Box direction="column" width="300px" gap="large">
        <Link href="/resources">
          <Box width="200px">
            <Button as="a" label="Add a Resource" href="/resources" primary />
          </Box>
        </Link>
        <Link href="/account/teams">
          <Anchor
            href="/account/teams"
            label="Add members of your lab or organization to help you manage resources"
          />
        </Link>
      </Box>
      <NextSteps />
    </Box>
  )
}
