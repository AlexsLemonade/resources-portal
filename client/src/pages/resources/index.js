import React from 'react'
import { Box, Heading, Button, Anchor, Text } from 'grommet'
import Link from 'next/link'
import { useUser } from 'hooks/useUser'
import CreateAccountLoginButton from 'components/CreateAccountLoginButton'
import ListResources from '../../images/list-resources.svg'

export default function ListResource() {
  const { isLoggedIn } = useUser()

  return (
    <Box width="xlarge" alignSelf="center" margin={{ bottom: 'xlarge' }}>
      <Box margin={{ bottom: 'large' }} direction="row" justify="between">
        <Box basis="2/3" pad={{ right: 'xlarge' }}>
          <Heading level="4" serif margin={{ top: 'none', bottom: 'medium' }}>
            Add Resources
          </Heading>
          <Text>
            We recommend, where possible, depositing your resources in a public
            repository specific to the resource type and then importing them
            here. Using these repositories will reduce administrative burden on
            you and your staff. It also increases resource discoverability,
            improves research transparency and may lead to increased citations
            of your work.
          </Text>
        </Box>
        <Box>
          <ListResources />
        </Box>
      </Box>

      <p>Here are a few recommended repositories to get you started:</p>
      <Box direction="row" margin={{ top: 'medium' }} justify="between">
        <Box
          basis="2/3"
          border={{ side: 'right', size: 'small', color: 'black-tint-95' }}
          pad={{ right: 'xxlarge' }}
        >
          <Box direction="row" gap="large" pad={{ bottom: 'large' }}>
            <Box>
              <Text size="large" color="brand">
                Cell Lines
              </Text>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
            <Box>
              <Text size="large" color="brand">
                Plasmid
              </Text>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
            <Box>
              <Text size="large" color="brand">
                Protocols
              </Text>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
          </Box>
          <Box
            direction="row"
            gap="large"
            pad={{ bottom: 'large' }}
            align="end"
          >
            <Box>
              <Text size="large" color="brand">
                Datasets
              </Text>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
            <Box>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
            <Box>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
          </Box>
          <Box direction="row" gap="large" pad={{ bottom: 'large' }}>
            <Box>
              <Text size="large" color="brand">
                Mouse Models
              </Text>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
            <Box>
              <Text size="large" color="brand">
                Zebrafish Models
              </Text>
              <Anchor href="https://www.atcc.org/Services/Deposit_Services.aspx">
                <img alt="add resource" src="http://placehold.it/156x100" />
              </Anchor>
            </Box>
          </Box>
        </Box>
        <Box justify="center" pad={{ left: 'xxlarge' }}>
          {isLoggedIn && (
            <Box align="center" pad={{ bottom: 'xlarge' }}>
              <Text
                size="large"
                textAlign="center"
                weight="normal"
                margin={{ bottom: 'medium' }}
              >
                Already listed your resource in a repository?
              </Text>
              <Link href="/resources/import">
                <Button label="Import" primary />
              </Link>
            </Box>
          )}
          {!isLoggedIn && (
            <Box align="center" pad="large" elevation="medium" width="330px">
              <Text
                size="medium"
                textAlign="center"
                weight="bold"
                margin={{ bottom: 'medium' }}
              >
                Sign in / Create Account to List or Import Resources
              </Text>
              <CreateAccountLoginButton
                title="Sign in/ Create Account"
                plainButton
              />
            </Box>
          )}
        </Box>
      </Box>
      {isLoggedIn && (
        <Box
          width="medium"
          margin={{ top: 'xlarge' }}
          pad="medium"
          round="xsmall"
          border
          alignSelf="center"
          elevation="small"
        >
          <Text>
            Repository for your resource doesn’t exist? Can’t list your resource
            in a repository yet?{' '}
            <Link href="/resources/list">
              <Anchor label="List with us." />
            </Link>
          </Text>
        </Box>
      )}
    </Box>
  )
}
