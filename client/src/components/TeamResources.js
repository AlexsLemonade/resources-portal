import React from 'react'
import { Box, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import { ManageResourceCard } from 'components/resources/ManageResourceCard'
import useTeamForm from 'hooks/useTeamForm'

export default () => {
  const {
    team: { materials: resources }
  } = useTeamForm()
  return (
    <Box pad={{ vertical: 'medium' }}>
      {resources.length === 0 && (
        <Text italic color="black-tint-60">
          You have no resources.
        </Text>
      )}
      {resources.length > 0 && (
        <>
          <HeaderRow label={`Resources (${resources.length})`} />
          <Box margin={{ top: 'medium' }}>
            {resources.map((resource) => (
              <Box
                key={resource.id}
                margin={{ vertical: 'medium' }}
                elevation="medium"
                pad={{ vertical: 'medium', horizontal: 'large' }}
              >
                <ManageResourceCard
                  resource={resource}
                  options={['edit', 'manage']}
                  moreOptions={['view', 'archive', 'delete']}
                  margin={{ bottom: 'large' }}
                />
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}
