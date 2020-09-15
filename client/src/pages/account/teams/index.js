import React from 'react'
import { Box, Button, Grid, Text } from 'grommet'
import Link from 'next/link'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import Icon from 'components/Icon'
import { Loader } from 'components/Loader'
import { useUser } from 'hooks/useUser'
import api from 'api'
import EmptyTeams from '../../../images/empty-teams.svg'

const Teams = () => {
  // get existing teams (organizations)
  const { user, token } = useUser()
  const [teams, setTeams] = React.useState()

  React.useEffect(() => {
    const fetchTeams = async () => {
      const teamsRequest = await api.user.teams.list(user.id, token)
      if (teamsRequest.isOk && teamsRequest.response) {
        const publicTeams = teamsRequest.response.results.filter(
          (t) => t.id !== user.personal_organization.id
        )
        setTeams(publicTeams)
      }
    }

    if (!teams) fetchTeams()
  }, [])

  if (!teams) return <Loader />

  return (
    <DrillDownNav title="Teams">
      {teams.length === 0 && (
        <AccountEmptyPage
          paragraphs={[
            "You haven't created any teams yet.",
            'Creating a team allows you to invite members of your lab or collaborators to help you manage resources.'
          ]}
          image=""
          buttonLabel="Create Team"
          link="/account/teams/create"
        >
          <EmptyTeams />
        </AccountEmptyPage>
      )}
      {teams.length > 0 && (
        <Grid columns={{ count: 2, size: 'auto' }} gap="large">
          {teams.map((team) => (
            <Box key={team.id} align="start" elevation="medium" pad="medium">
              <Text weight="bold">{team.name}</Text>
              <Box
                border={{ side: 'bottom', color: 'black-tint-95', size: '2px' }}
                width="full"
              >
                <Text color="black-tint-30">
                  {team.materials.length} Resources . {team.members.length}{' '}
                  Members . {team.grants.length} Grants
                </Text>
              </Box>
              <Text margin={{ vertical: 'medium' }}>
                {team.description || 'No Description'}
              </Text>
              <Link href={`/account/teams/${team.id}`}>
                <Button primary label="View Team" />
              </Link>
            </Box>
          ))}
          <Box border={{ style: 'dashed', size: 'small', color: 'brand' }}>
            <Link href="/account/teams/create">
              <Box fill align="center" justify="center" pad="xlarge">
                <Icon name="Plus" size="large" />
                <Button plain size="large" label="Create New Team" />
              </Box>
            </Link>
          </Box>
        </Grid>
      )}
    </DrillDownNav>
  )
}

export default Teams
