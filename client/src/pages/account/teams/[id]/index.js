import React from 'react'
import { Box, Text, Tabs, Tab } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { Loader } from 'components/Loader'
import useTeamForm from 'hooks/useTeamForm'
import { TeamContextProvider } from 'contexts/TeamContext'
import TeamResources from 'components/TeamResources'
import TeamMembers from 'components/TeamMembers'
import TeamGrants from 'components/TeamGrants'

const TeamDetailContext = ({ teamId }) => {
  const { team, fetchTeam, teamFetched } = useTeamForm()

  React.useEffect(() => {
    if (!teamFetched) fetchTeam(teamId)
  }, [])

  if (!teamFetched) return <Loader />

  return (
    <DrillDownNav title={team.name} linkBack="/account/teams">
      <Box margin={{ vertical: 'medium' }}>
        <Text>{team.description}</Text>
      </Box>
      <Tabs>
        <Tab title="Team Resources">
          <TeamResources />
        </Tab>
        <Tab title="Members">
          <TeamMembers />
        </Tab>
        <Tab title="Linked Grants">
          <TeamGrants />
        </Tab>
      </Tabs>
    </DrillDownNav>
  )
}

const TeamDetail = ({ teamId }) => {
  return (
    <TeamContextProvider>
      <TeamDetailContext teamId={teamId} />
    </TeamContextProvider>
  )
}

TeamDetail.getInitialProps = ({ query: { id } }) => {
  return { teamId: id }
}

export default TeamDetail
