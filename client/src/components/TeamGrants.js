import React from 'react'
import { Box, Paragraph, Text } from 'grommet'
import { HeaderRow } from 'components/HeaderRow'
import Icon from 'components/Icon'
import useTeamForm from 'hooks/useTeamForm'
import GrantRemoveButton from 'components/GrantRemoveButton'
import GrantAddButton from 'components/GrantAddButton'

export default () => {
  const {
    team: { grants }
  } = useTeamForm()

  return (
    <Box pad={{ vertical: 'medium' }}>
      {grants.length === 0 && (
        <Text italic color="black-tint-60">
          You have no linked grants.
        </Text>
      )}
      <GrantAddButton />
      {grants.length > 0 && (
        <>
          <HeaderRow label={`Grants (${grants.length})`} />
          {grants.map((grant) => (
            <Box key={grant.id} direction="row" justify="between">
              <Box direction="row" align="center">
                <Icon color="plain" name="Grant" />
                <Box pad={{ left: 'small' }}>
                  <Paragraph margin="none">{grant.title}</Paragraph>
                  <Paragraph size="small">Grant ID:{grant.funder_id}</Paragraph>
                </Box>
              </Box>
              <GrantRemoveButton grant={grant} />
            </Box>
          ))}
        </>
      )}
    </Box>
  )
}
