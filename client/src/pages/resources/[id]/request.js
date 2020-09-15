import React from 'react'
import { Box, Heading, Anchor } from 'grommet'
import Link from 'next/link'
import Error from 'pages/404'
import dynamic from 'next/dynamic'
import api from 'api'
import { getReadable } from 'helpers/readableNames'

const RequestResourceForm = dynamic(
  () => import('components/resources/RequestResourceForm'),
  { ssr: false }
)

const ResourcesRequest = ({ resource }) => {
  // you cannot request this resource
  // it might be deleted
  if (!resource) return <Error statusCode="404" />

  return (
    <Box align="center" width="full" margin={{ vertical: 'xlarge' }}>
      <Box width="large">
        <Heading level={4} serif alignSelf="start">
          Request{' '}
          <Link href={`/resources/${resource.id}`}>
            <Anchor href="#">{resource.title}</Anchor>
          </Link>{' '}
          - {getReadable(resource.category)}
        </Heading>
        <RequestResourceForm resource={resource} />
      </Box>
    </Box>
  )
}

ResourcesRequest.getInitialProps = async ({ query: { id } }) => {
  const resourceRequest = await api.resources.get(id)
  if (resourceRequest.isOk) {
    const { response: resource } = resourceRequest
    return { resource }
  }
  return {}
}

export default ResourcesRequest
