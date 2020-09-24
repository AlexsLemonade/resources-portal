import React from 'react'
import { Box, Heading, Text, Tabs, Tab } from 'grommet'
import api from 'api'
import { ResourceDetails } from 'components/resources/ResourceDetails'
import { PublicationInformation } from 'components/resources/PublicationInformation'
import { ContactSubmitter } from 'components/resources/ContactSubmitter'
import { RequestRequirements } from 'components/resources/RequestRequirements'
import { RelatedResources } from 'components/resources/RelatedResources'
import { ResourceCard } from 'components/resources/ResourceCard'
import dynamic from 'next/dynamic'

const RequestButton = dynamic(() => import('components/RequestButton'), {
  ssr: false
})

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
        margin={{ bottom: 'xlarge' }}
      >
        <ResourceCard resource={resource} size="large">
          <RequestButton resource={resource} />
        </ResourceCard>
      </Box>
      <Box>
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
            <TabHeading title="Contact Submitter" />
            <ContactSubmitter resource={resource} />
          </Tab>
          <Tab title="Request Requirements">
            <TabHeading title="Request Requirements" />
            <RequestRequirements resource={resource} />
          </Tab>
        </Tabs>
      </Box>
      <RelatedResources resource={resource} />
    </>
  )
}

export default ResourceDetailsPage

const TabHeading = ({ title }) => (
  <Box
    border={[{ size: 'small', side: 'bottom', color: 'turteal-tint-80' }]}
    margin={{ bottom: 'large' }}
  >
    <Heading level="5" margin={{ bottom: 'small' }}>
      {title}
    </Heading>
  </Box>
)

ResourceDetailsPage.getInitialProps = async ({ query }) => {
  const apiResponse = await api.resources.get(query.id)
  return {
    resource: apiResponse.isOk ? apiResponse.response : false
  }
}
