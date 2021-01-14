import React from 'react'
import { Box, Heading, Button, Anchor, Text, Image, Paragraph } from 'grommet'
import Link from 'next/link'
import { useUser } from 'hooks/useUser'
import CreateAccountLoginButton from 'components/CreateAccountLoginButton'
import styled from 'styled-components'
import ListResources from '../../images/list-resources.svg'
// Link Logos

const SmallText = styled(Text)`
  line-height: 15px;
`

const LogoLinkRow = ({ rowTitle = false, items = [] }) => {
  return (
    <Box width="full" margin={{ bottom: 'large' }}>
      <Box direction="row">
        {items.map(({ title, href, image }, i) => (
          <Box basis="1/3" key={href} justify="end" pad={{ right: 'large' }}>
            {(title || (i === 0 && rowTitle)) && (
              <Text size="large" color="brand">
                {title || rowTitle}
              </Text>
            )}
            <Box
              as="a"
              margin={{ top: 'small' }}
              elevation="small"
              align="center"
              height="100px"
              justify="center"
              href={href}
              target="_blank"
            >
              <Image src={`/import-logos/${image}`} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default function ListResource() {
  const { isLoggedIn } = useUser()

  const logos = {
    sra: {
      href: 'https://www.ncbi.nlm.nih.gov/sra',
      image: 'sra.svg'
    },
    geo: {
      href: 'https://www.ncbi.nlm.nih.gov/geo/',
      image: 'geo.svg'
    },
    dbgap: {
      href: 'https://www.ncbi.nlm.nih.gov/gap/',
      image: 'dbgap.svg'
    },
    protocols: {
      title: 'Protocols',
      href: 'https://www.protocols.io/',
      image: 'protocolsio.png'
    },
    cellLines: {
      title: 'Cell Lines*',
      href: 'https://www.atcc.org/Services/Deposit_Services.aspx',
      image: 'atcc.png'
    },
    plasmids: {
      title: 'Plasmids*',
      href: 'https://www.addgene.org/',
      image: 'logo-addgene.png'
    },
    mouseModels: {
      title: 'Mouse Models*',
      href:
        'https://www.jax.org/jax-mice-and-services/cryo-and-strain-donation/donate-a-strain',
      image: 'jackson.png'
    },
    zebrafishModels: {
      title: 'Zebrafish Models*',
      href: 'https://zebrafish.org/home/guide.php',
      image: 'zirc-logo.gif'
    }
  }

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
          width="900px"
          border={{ side: 'right', size: 'small', color: 'black-tint-95' }}
          pad={{ bottom: 'xlarge', right: 'medium' }}
        >
          <LogoLinkRow
            rowTitle="Datasets"
            items={[logos.sra, logos.geo, logos.dbgap]}
          />
          <LogoLinkRow
            items={[logos.protocols, logos.cellLines, logos.plasmids]}
          />
          <LogoLinkRow items={[logos.mouseModels, logos.zebrafishModels]} />
          <Box>
            <Paragraph>
              <Text weight="bold">*Limited support for importing</Text>
            </Paragraph>
            <SmallText size="small">
              You can still add resources from these repositories, but we will
              not be able to extract metadata from the respective repositories.
              You will be prompted to fill out some basic information about the
              resource so that it is discoverable.
            </SmallText>
          </Box>
        </Box>
        <Box justify="center" pad={{ left: 'xxlarge' }}>
          {isLoggedIn && (
            <>
              <Box
                align="center"
                elevation="small"
                pad={{ horizontal: 'small', vertical: 'large' }}
              >
                <Paragraph
                  size="large"
                  textAlign="center"
                  margin={{ bottom: 'medium' }}
                >
                  Already listed your resource in a repository?
                </Paragraph>
                <Link href="/resources/import">
                  <Button label="Import" primary />
                </Link>
              </Box>
              <Box
                width="medium"
                margin={{ top: 'xlarge' }}
                round="xsmall"
                alignSelf="center"
              >
                <Text>
                  Repository for your resource doesn’t exist? Can’t list your
                  resource in a repository yet?{' '}
                  <Link href="/resources/list">
                    <Anchor label="List with us." />
                  </Link>
                </Text>
              </Box>
            </>
          )}
          {!isLoggedIn && (
            <Box align="center" pad="large" elevation="medium">
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
    </Box>
  )
}
