import React from 'react'
import { Box, Text, Button } from 'grommet'
import useResourceForm from 'hooks/useResourceForm'
import { getReadable } from 'helpers/readableNames'
import { HeaderRow } from 'components/HeaderRow'
import DetailsTable from 'components/DetailsTable'
import { ResourceDetails } from 'components/resources/ResourceDetails'
import { PublicationInformation } from 'components/resources/PublicationInformation'
import { ReviewRequestRequirements } from 'components/resources/RequestRequirements'
import Icon from 'components/Icon'

export default ({ onEditResourceDetails, onEditResourceRequirements }) => {
  const {
    resource,
    existingRequirementsResource,
    contactUserOptions
  } = useResourceForm()
  const { imported } = resource
  const requirementsResource =
    existingRequirementsResource && existingRequirementsResource.id
      ? existingRequirementsResource
      : resource

  const contactUser = contactUserOptions.find(
    (u) => u.id === resource.contact_user
  )

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
        <HeaderRow label="Contact User" />
        <DetailsTable
          data={[
            {
              label: 'Name',
              value: contactUser.full_name
            },
            {
              label: 'Email',
              value: contactUser.email
            }
          ]}
        />
        <HeaderRow label="Publication Information" />
        <PublicationInformation resource={resource} />
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
