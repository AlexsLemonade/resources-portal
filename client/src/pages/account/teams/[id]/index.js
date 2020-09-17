import React from 'react'
import { Box, Button, CheckBox, Paragraph, Text, Tabs, Tab } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { ManageResourceCard } from 'components/resources/ManageResourceCard'
import TeamMembersTable from 'components/TeamMembersTable'
import { Modal } from 'components/Modal'
import { Loader } from 'components/Loader'
import { HeaderRow } from 'components/HeaderRow'
import Icon from 'components/Icon'
import useTeamForm from 'hooks/useTeamForm'

const TeamDetail = ({ teamId }) => {
  const {
    user,
    team,
    fetchTeam,
    teamFetched,
    addGrant,
    removeGrant
  } = useTeamForm()
  const [showGrantsModal, setShowGrantsModal] = React.useState(false)

  React.useEffect(() => {
    if (!teamFetched) fetchTeam(teamId)
  }, [])

  if (!teamFetched) return <Loader />

  const { materials: resources, grants = [] } = team

  return (
    <DrillDownNav title={team.name} linkBack="/account/teams">
      <Box margin={{ vertical: 'medium' }}>
        <Text>{team.description}</Text>
      </Box>
      <Tabs>
        <Tab title="Team Resources">
          <Box pad={{ vertical: 'medium' }}>
            {resources.length === 0 && (
              <Text italic color="black-tint-60">
                You have no resources.
              </Text>
            )}
            {resources.length > 0 && (
              <>
                <HeaderRow label={`Resources (${resources.length})`} />
                {resources.map((resource) => (
                  <ManageResourceCard key={resource.id} resource={resource} />
                ))}
              </>
            )}
          </Box>
        </Tab>
        <Tab title="Members">
          <Box pad={{ vertical: 'medium' }}>
            {team.members.length === 0 && (
              <Text italic color="black-tint-60">
                You have no members.
              </Text>
            )}
            <HeaderRow label={`Members (${team.members.length})`} />
            <TeamMembersTable team={team} />
          </Box>
        </Tab>
        <Tab title="Linked Grants">
          <Box pad={{ vertical: 'medium' }}>
            {grants.length === 0 && (
              <Text italic color="black-tint-60">
                You have no linked grants.
              </Text>
            )}
            <Button
              alignSelf="end"
              primary
              label="Link Grants"
              onClick={() => setShowGrantsModal(true)}
            />
            <Modal showing={showGrantsModal} setShowing={setShowGrantsModal}>
              <Box width="large">
                <Box border={{ side: 'bottom' }} margin={{ bottom: 'medium' }}>
                  <Text serif size="xlarge">
                    Link Grants
                  </Text>
                </Box>
                <Text>
                  Members of your team may only add resources and manage
                  requests linked with a particular grant. Select the grant(s)
                  below to associate with this team.
                </Text>
                <Text weight="bold" margin={{ vertical: 'medium' }}>
                  Grants awarded to you (choose as many as appropriate)
                </Text>
                {user.grants.length === 0 && (
                  <Paragraph>You have no grants.</Paragraph>
                )}
                {user.grants.map((grant) => (
                  <CheckBox
                    key={grant.id}
                    label={grant.title}
                    checked={grants.map((g) => g.id).includes(grant.id)}
                    onChange={async ({ target: { checked } }) => {
                      if (checked) await addGrant(teamId, grant.id)
                      if (!checked) await removeGrant(teamId, grant.id)
                      fetchTeam(teamId)
                    }}
                  />
                ))}
                <Button
                  primary
                  alignSelf="end"
                  margin={{ vertical: 'medium' }}
                  label="Done"
                  onClick={() => {
                    setShowGrantsModal(false)
                  }}
                />
              </Box>
            </Modal>
            {grants.length > 0 && (
              <>
                <HeaderRow label={`Grants (${grants.length})`} />
                {grants.map(({ title, funder_id: funderId, id }) => (
                  <Box key={funderId} direction="row" justify="between">
                    <Box direction="row" align="center">
                      <Icon color="plain" name="Grant" />
                      <Box pad={{ left: 'small' }}>
                        <Paragraph margin="none">{title}</Paragraph>
                        <Paragraph size="small">Grant ID:{funderId}</Paragraph>
                      </Box>
                    </Box>
                    <Button
                      plain
                      size="small"
                      color="error"
                      icon={<Icon name="Trashcan" color="error" size="small" />}
                      label="Remove"
                      onClick={async () => {
                        await removeGrant(teamId, id)
                        fetchTeam(teamId)
                      }}
                    />
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Tab>
      </Tabs>
    </DrillDownNav>
  )
}

TeamDetail.getInitialProps = ({ query: { id } }) => {
  return { teamId: id }
}

export default TeamDetail
