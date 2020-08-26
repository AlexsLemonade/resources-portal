import React from 'react'
import { DrillDownNav } from 'components/DrillDownNav'
import { AccountEmptyPage } from 'components/AccountEmptyPage'
import EmptyTeams from '../../../images/empty-teams.svg'

const Teams = () => {
  // get existing teams (organizations)
  const teams = []

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
    </DrillDownNav>
  )
}

export default Teams
