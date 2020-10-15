import React from 'react'
import { Box, Text, Button } from 'grommet'
import useResourceForm from 'hooks/useResourceForm'
import { getReadable } from 'helpers/readableNames'
import { ResourceDetails } from 'components/resources/ResourceDetails'
import { ReviewRequestRequirements } from 'components/resources/RequestRequirements'
import Icon from 'components/Icon'

export default ({
  onEditResourceDetails,
  onEditResourceRequirements,
  imported = false
}) => {
  const { resource, existingRequirementsResource } = useResourceForm()

  const requirementsResource =
    existingRequirementsResource && existingRequirementsResource.id
      ? existingRequirementsResource
      : resource

  return (
    <Box width="xlarge">
      <Box
        border={{ side: 'bottom', color: 'turteal-tint-60' }}
        margin={{ vertical: 'large' }}
      >
        <Text size="large" weight="bold">
          Review and Publish
        </Text>
      </Box>
      <Box direction="row" gap="xlarge">
        <Box>
          <Text weight="bold" margin={{ vertical: 'medium' }}>
            Grant ID
          </Text>
          {resource.grants.map((grant) => (
            <Text key={grant.funder_id}>{grant.title}</Text>
          ))}
        </Box>
        <Box>
          <Text weight="bold" margin={{ vertical: 'medium' }}>
            Resource Type
          </Text>
          <Text>{getReadable(resource.category)}</Text>
        </Box>
      </Box>
      <Box>
        <Box
          direction="row"
          gap="medium"
          border={{ side: 'bottom', color: 'turteal-tint-60' }}
          margin={{ vertical: 'large' }}
        >
          <Text size="large" margin={{ bottom: 'small' }}>
            Resource Details
          </Text>
          <Button
            plain
            size="small"
            icon={<Icon size="16px" name="Edit" />}
            label="Edit"
            onClick={onEditResourceDetails}
          />
        </Box>
        <ResourceDetails resource={resource} />
      </Box>
      {!imported && (
        <Box>
          <Box
            direction="row"
            gap="medium"
            border={{ side: 'bottom', color: 'turteal-tint-60' }}
            margin={{ vertical: 'large' }}
          >
            <Text size="large" margin={{ bottom: 'small' }}>
              Request Requirements
            </Text>
            <Button
              plain
              size="small"
              icon={<Icon size="16px" name="Edit" />}
              label="Edit"
              onClick={onEditResourceRequirements}
            />
          </Box>
          <ReviewRequestRequirements resource={requirementsResource} />
        </Box>
      )}
    </Box>
  )
}
