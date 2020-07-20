import React from 'react'
import { Box, Heading, Anchor, Text, Button, Tabs, Tab } from 'grommet'
import Link from 'next/link'
import api from '../../../api'
// import { ResourceDetails } from '../../../components/resources/ResourceDetails'
import DetailsTable from '../../../components/DetailsTable'
import Organism from '../../../images/organism.svg'
import ResourceType from '../../../images/resource-type.svg'

const ResourceDetails = () => {
  return <>IMPLEMENT THIS</>
}

const ResourceDetailsPage = ({ resource }) => {
  if (!resource)
    return (
      <Text>
        This resource is not currently available. Please try again soon.
      </Text>
    )

  return (
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
        value: resource.pubmedid
      },
      {
        label: 'Publication Title',
        value: resource.publication_title
      },
      {
        label: 'Pre-print DOI',
        value: resource.pre_print_doi
      },
      {
        label: 'Pre-print Title',
        value: resource.pre_print_title
      },
      { label: 'Citation', value: resource.additional_metadata.citation }
    ]}
  />
)

ResourceDetailsPage.getInitialProps = async ({ query }) => {
  const apiResponse = await api.resources.find(query.id)
  return {
    resource: apiResponse.isOk ? apiResponse.response : false
  }
}
