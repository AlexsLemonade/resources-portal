import React from 'react'
import dynamic from 'next/dynamic'
import { Box, Heading, Text, Paragraph } from 'grommet'
import Link from 'components/Link'
import styled from 'styled-components'
import ListResources from '../../images/list-resources.svg'

const ResourceImportListOptions = dynamic(
  () => import('components/ResourceImportListOptions'),
  { ssr: false }
)

const SmallText = styled(Text)`
  line-height: 15px;
`

export default function ListResource() {
  const supportedRepos = [
    {
      repo: 'Datasets',
      repos: [
        { label: 'GEO', href: 'https://www.ncbi.nlm.nih.gov/geo/' },
        {
          label: 'SRA',
          href: 'https://www.ncbi.nlm.nih.gov/sra'
        },
        {
          label: 'dbGaP',
          href: 'https://www.ncbi.nlm.nih.gov/gap/'
        }
      ]
    },
    {
      repo: 'Protocols',
      repos: [
        {
          label: 'Protocols',
          href: 'https://www.protocols.io/'
        }
      ]
    },
    {
      repo: 'Cell Lines*',
      repos: [
        {
          label: 'ATCC',
          href: 'https://www.atcc.org/Services/Deposit_Services.aspx'
        }
      ]
    },
    {
      repo: 'Mouse Models*',
      repos: [
        {
          label: 'Mouse Models*',
          href:
            'https://www.jax.org/jax-mice-and-services/cryo-and-strain-donation/donate-a-strain'
        }
      ]
    },
    {
      repo: 'Zebrafish Models*',
      repos: [
        {
          label: 'Zebrafish Models*',
          href: 'https://zebrafish.org/home/guide.php'
        }
      ]
    },
    {
      repo: 'Plasmids*',
      repos: [
        {
          label: 'Add Gene*',
          href: 'https://www.addgene.org/'
        }
      ]
    }
  ]

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
      <ResourceImportListOptions />
      <Box margin={{ vertical: 'large' }}>
        <Text serif size="large" margin={{ bottom: 'medium' }}>
          Supported Repositories
        </Text>
        <Box direction="row" justify="between">
          {supportedRepos.map(({ repo, repos }) => (
            <Box key={repo}>
              <Text weight="bold" margin={{ bottom: 'small' }}>
                {repo}
              </Text>
              {repos.map(({ label, href }) => (
                <Link key={href} href={href} label={label} />
              ))}
            </Box>
          ))}
        </Box>
        <Box width="medium" margin={{ top: 'large' }}>
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
      </Box>
    </Box>
  )
}
