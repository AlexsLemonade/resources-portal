import React from 'react'
import { Box } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { HeaderRow } from 'components/HeaderRow'
import { CheckBoxWithInfo } from 'components/CheckBoxWithInfo'

export const Settings = () => {
  return (
    <DrillDownNav
      title="Notification Settings"
      linkBack="/account/notifications"
    >
      <HeaderRow label="Email Notifications" />
      <Box>
        <Box margin={{ top: 'medium' }}>
          <CheckBoxWithInfo
            disabled
            checked
            label="Send updates only about items assigned to me"
            info="You will only receive real-time email updates assigned to you and when members join teams created by you."
          />
        </Box>
        <Box margin={{ top: 'large' }}>
          <CheckBoxWithInfo
            label="Send updates all times"
            info="You will receive real-time email updates about requests and new team members for all teams you are a part of."
          />
        </Box>
        <Box margin={{ top: 'large' }}>
          <CheckBoxWithInfo
            checked
            label="Send me a weekly digest of updates"
            info="You will recieve email updates about requests, resources, and teams you are part of once a week."
          />
        </Box>
      </Box>
    </DrillDownNav>
  )
}

export default Settings
