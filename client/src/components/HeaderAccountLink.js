import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import Link from 'next/link'
import { useNotifications } from 'hooks/useNotifications'
import CreateAccountLoginButton from 'components/CreateAccountLoginButton'
import { useUser } from 'hooks/useUser'

export default () => {
  const { isLoggedIn } = useUser()
  const [notificationsFetched, setNotificationsFetched] = React.useState(false)
  const { notificationCount, fetchNewNotifications } = useNotifications()

  React.useEffect(() => {
    const fetchNotifications = async () => {
      fetchNewNotifications().then(() => {
        setNotificationsFetched(true)
      })
    }

    if (!notificationsFetched && isLoggedIn) {
      fetchNotifications()
    }
  })

  if (!isLoggedIn) {
    return <CreateAccountLoginButton title="Create a CCRR Portal Account" />
  }

  return (
    <Box direction="row" gap="small">
      <Link href="/account">
        <Anchor
          color="white"
          href="/account/basic-information"
          label="My Account"
        />
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
