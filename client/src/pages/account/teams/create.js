import React from 'react'
import dynamic from 'next/dynamic'
import { DrillDownNav } from 'components/DrillDownNav'
import { TeamContextProvider } from 'contexts/TeamContext'

const TeamForm = dynamic(() => import('components/TeamForm'), { ssr: false })

const TeamCreate = () => {
  return (
    <DrillDownNav title="Create Team" linkBack="/account/teams">
      <TeamContextProvider>
        <TeamForm />
      </TeamContextProvider>
    </DrillDownNav>
  )
}

export default TeamCreate
