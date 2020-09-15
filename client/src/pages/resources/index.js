import React from 'react'
import { Box, Heading, Button, Anchor, Text } from 'grommet'
import Link from 'next/link'
import ListResources from '../../images/list-resources.svg'

export default function ListResource() {
  return (
    <Box width="xlarge" alignSelf="center" margin={{ bottom: 'xlarge' }}>
      <Box margin={{ bottom: 'large' }} direction="row" justify="between">
        <Box basis="2/3" pad={{ right: 'xlarge' }}>
          <Heading level="4" serif margin={{ top: 'none', bottom: 'medium' }}>
            Add Resources
          </Heading>
          <p>
            We recommend you to list your resource in a repository specific to
            your resource and import them here.
          </p>
          <p>
            Using these repositories will reduce the administrative burden on
            your and your staff. It also increases discoverability and
            citations.
          </p>
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
        </Box>
      </Box>
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
            <Anchor label="List with us" />
          </Link>
        </Text>
      </Box>
    </Box>
  )
}
