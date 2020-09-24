import { Anchor, Box, Text } from 'grommet'
import Link from 'next/link'
import * as React from 'react'
import { useNotifications } from 'hooks/useNotifications'
import { useUser } from '../hooks/useUser'
import { CreateAccountLoginButton } from './CreateAccountLoginButton'

export const HeaderAccountLink = () => {
  const { isLoggedIn } = useUser()
  const [notificationsFetched, setNotificationsFetched] = React.useState(false)
  const { notificationCount, fetchNewNotifications } = useNotifications()

  React.useEffect(() => {
    if (!notificationsFetched) {
      fetchNewNotifications().then(() => {
        setNotificationsFetched(true)
      })
    }
  })

  if (!isLoggedIn) {
    return (
      <CreateAccountLoginButton title="Create a BioResources Portal Account" />
    )
  }

  return (
    <Box direction="row" gap="small">
      <Link href="/account">
        <Anchor color="white" href="#" label="My Account" />
      </Link>
      {notificationCount > 0 && (
        <Link href="/account/notifications">
          <Box
            align="center"
            pad="2px"
            width={{ min: '28px' }}
            round
            background="error"
          >
            <Text>{notificationCount}</Text>
          </Box>
        </Link>
      )}
    </Box>
  )
}

export default HeaderAccountLink
