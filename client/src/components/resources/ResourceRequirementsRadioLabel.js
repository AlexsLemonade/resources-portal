import React from 'react'
import { Box, Text } from 'grommet'
import Icon from 'components/Icon'
import RequestRequirementsList from 'components/resources/RequestRequirementsList'

export default ({ resource }) => {
  return (
    <Box pad={{ vertical: 'medium' }} width="100%">
      <Box
        elevation="medium"
        pad={{ horizontal: 'large', vertical: 'medium' }}
        width={{ max: '500px' }}
      >
        <Text weight="bold">{resource.title}</Text>
        <>
          <Box direction="row" gap="small" margin={{ vertical: 'medium' }}>
            {resource.grants.length > 0 && (
              <>
                <Icon color="plain" name="Grant" />
                {resource.grants.map((g) => (
                  <Text key={g.id}>{g && g.title}</Text>
                ))}
              </>
            )}
          </Box>
          <Text>
            <Text weight="bold">Requires:</Text>{' '}
            <RequestRequirementsList resource={resource} />
          </Text>
        </>
      </Box>
    </Box>
  )
}
