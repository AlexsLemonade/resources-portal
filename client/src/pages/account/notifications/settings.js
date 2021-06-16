import React from 'react'
import { Box } from 'grommet'
import { DrillDownNav } from 'components/DrillDownNav'
import { HeaderRow } from 'components/HeaderRow'
import { CheckBoxWithInfo } from 'components/CheckBoxWithInfo'
import { useUser } from 'hooks/useUser'

export const Settings = () => {
  const {
    user,
    refreshUser,
    isLoggedIn,
    updateReceiveNonAssignedNotifs,
    updateReceiveWeeklyDigest
  } = useUser()

  const readyRef = React.useRef(false)
  const [nonAssignedNotifs, setNonAssignedNotifs] = React.useState(
    user.receive_non_assigned_notifs
  )
  const [weeklyDigest, setWeeklyDigest] = React.useState(
    user.reveive_weekly_digest
  )

  React.useEffect(() => {
    const refresh = async () => {
      await refreshUser()
      readyRef.current = true
    }
    if (isLoggedIn) refresh()
  }, [])

  React.useEffect(() => {
    const asyncUpdate = async () => {
      const success = updateReceiveNonAssignedNotifs(nonAssignedNotifs)
      if (!success) {
        setNonAssignedNotifs(user.receive_non_assigned_notifs)
      }
    }
    if (readyRef.current && nonAssignedNotifs !== user.non_assigned_notifs) {
      asyncUpdate()
    }
  }, [nonAssignedNotifs])

  React.useEffect(() => {
    const asyncUpdate = async () => {
      const success = updateReceiveWeeklyDigest(weeklyDigest)
      if (!success) {
        setWeeklyDigest(user.receive_weekly_digest)
      }
    }
    if (readyRef.current && weeklyDigest !== user.receive_weekly_digest) {
      asyncUpdate()
    }
  }, [weeklyDigest])

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
            checked={nonAssignedNotifs}
            onChange={(event) => setNonAssignedNotifs(event.target.checked)}
            label="Send updates all times"
            info="You will receive real-time email updates about requests and new team members for all teams you are a part of."
          />
        </Box>
        <Box margin={{ top: 'large' }}>
          <CheckBoxWithInfo
            checked={weeklyDigest}
            onChange={(event) => setWeeklyDigest(event.target.checked)}
            label="Send me a weekly digest of updates"
            info="You will recieve email updates about requests, resources, and teams you are part of once a week."
          />
        </Box>
      </Box>
    </DrillDownNav>
  )
}

export default Settings
