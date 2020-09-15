import React from 'react'
import dynamic from 'next/dynamic'
import { DrillDownNav } from 'components/DrillDownNav'

const TeamForm = dynamic(() => import('components/TeamForm'), { ssr: false })

const TeamCreate = () => {
  return (
    <DrillDownNav title="Create Team" linkBack="/account/teams">
      <TeamForm />
    </DrillDownNav>
  )
}

export default TeamCreate
