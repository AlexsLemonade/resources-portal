import React from 'react'
import { Box, Heading, Anchor, Text, Button, Tabs, Tab } from 'grommet'
import Link from 'next/link'
import { materialsTestData } from '../../../helpers/testData'
import { ResourceDetails } from '../../../components/resources'
import DetailsTable from '../../../components/DetailsTable'
import Organism from '../../../images/organism.svg'
import ResourceType from '../../../images/resource-type.svg'

const ResourceDetailsPage = ({ resource }) => (
  <>
    <Box
      direction="row"
      justify="between"
      align="center"
      margin={{ bottom: 'large' }}
    >
      <Box pad="large">
        <Heading level="5" margin={{ top: '0', bottom: 'large' }}>
          <Link href="/resources/[id]" as={`/resources/${resource.id}`}>
            <Anchor label={resource.title} />
          </Link>
        </Heading>

        <Box direction="row">
          <ResourceType />
          <Text margin={{ left: 'small', right: 'xlarge' }}>
            {resource.category}
          </Text>

          <Organism />
          <Text margin={{ left: 'small' }}>
            {resource.additional_metadata.organism}
          </Text>
        </Box>
      </Box>
      <div>
        <Link
          href="/resources/[id]/request"
          as={`/resources/${resource.id}/request`}
        >
          <Button label="Request" primary />
        </Link>
      </div>
    </Box>

    <div>
      <Tabs>
        <Tab title="Resource Details">
          <TabHeading title="Resource Details" />
          <ResourceDetails resource={resource} />
        </Tab>
        <Tab title="Publication Information">
          <TabHeading title="Publication Information" />

          <PublicationInformation resource={resource} />
        </Tab>
        <Tab title="Contact Submitter">
          <Box alvign="center" pad="large" gap="large">
            TODO: Contact Submitter
          </Box>
        </Tab>
        <Tab title="Request Requirements">
          <Box alvign="center" pad="large" gap="large">
            TODO: Request Requirements
          </Box>
        </Tab>
      </Tabs>
    </div>
  </>
)

export default ResourceDetailsPage

const TabHeading = ({ title }) => (
  <Box
    border={[{ size: 'xsmall', side: 'bottom', color: 'turteal-tint-80' }]}
    margin={{ bottom: 'large' }}
  >
    <Heading level="5" margin={{ bottom: 'medium' }}>
      {title}
    </Heading>
  </Box>
)

const PublicationInformation = ({ resource }) => (
  <DetailsTable
    data={[
      {
        label: 'PubMed ID',
        value: resource.additional_metadata.pubmedid
      },
      {
        label: 'Publication Title',
        value: resource.additional_metadata.publication_title
      },
      {
        label: 'Pre-print DOI',
        value: resource.additional_metadata.pre_print_doi
      },
      {
        label: 'Pre-print Title',
        value: resource.additional_metadata.pre_print_title
      },
      { label: 'Citation', value: resource.additional_metadata.citation }
    ]}
  />
)

ResourceDetailsPage.getInitialProps = async ({ query }) => {
  const resource = materialsTestData.find(
    (material) => material.id === query.id
  )
  return {
    resource
  }
}
