import React from 'react'
import { Paragraph } from 'grommet'
import { DrillDownNav } from '../../components/DrillDownNav'

const Account = () => {
  return (
    <DrillDownNav title="Welcome">
      <Paragraph>
        This is your account. You can manage your information, manage resources,
        view your request, manage your teams, and view notifications from here.
      </Paragraph>
    </DrillDownNav>
  )
}

export default Account
