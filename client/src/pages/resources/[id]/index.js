import React from 'react'

import {
  Box,
  Heading,
  Anchor,
  Text,
  Button,
  Tabs,
  Tab,
  Paragraph
} from 'grommet'
import Link from 'next/link'
import { ResourceDetails } from '../../../resources'
import { getResourceDetails } from '../../../common/api'

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
          <Box
            border={[
              { size: 'xsmall', side: 'bottom', color: 'turteal-tint-80' }
            ]}
            margin={{ bottom: 'large' }}
          >
            <Heading level="5" margin={{ bottom: 'medium' }}>
              Resource Details
            </Heading>
          </Box>

          <ResourceDetails resource={resource} />
        </Tab>
        <Tab title="Publication Information">
          <Box alvign="center" pad="large" gap="large">
            TODO: Publication information
          </Box>
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
