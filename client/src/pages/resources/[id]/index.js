import React from 'react'

import { Box, Heading, Anchor, Text, Button, Tabs, Tab } from 'grommet'
import Link from 'next/link'
import { ResourceDetails } from '../../../resources'
import { getResourceDetails } from '../../../common/api'
import DetailsTable from '../../../components/DetailsTable'

const ResourceDetailsPage = ({ resource }) => (
  <>
    <Box
      direction="row"
      justify="between"
      align="center"
      margin={{ bottom: 'large' }}
    >
      <div>
        <Heading level="5" margin={{ top: '0', bottom: 'small' }}>
          <Link href="/resources/[id]" as={`/resources/${resource.id}`}>
            <Anchor label={resource.title} />
          </Link>
        </Heading>
        <Text margin={{ right: 'large' }}>[i] {resource.category}</Text>

        <Text>[i] {resource.additional_metadata.organism}</Text>
      </div>
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
ResourceDetailsPage.getInitialProps = async ({ query }) => {
  const resource = await getResourceDetails({ id: query.id })
  return { resource }
}
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
