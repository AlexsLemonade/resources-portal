import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import NextLink from 'next/link'

const readableTimeAgo = (time) => {
  const oneDay = 24 * 60 * 60 * 1000
  const date = new Date(time)
  const today = new Date()
  const yearsAgo = today.getFullYear() - date.getFullYear()
  if (yearsAgo > 0) return `${yearsAgo} years ago`
  const daysAgo = Math.round(Math.abs((date - today) / oneDay))
  return daysAgo > 0 ? `${daysAgo} days ago` : 'today'
}

export const Notification = ({ notification, Link = NextLink }) => {
  return (
    <Box round="medium" elevation="1" fill="horizontal" pad="medium">
      <Box direction="row" border={{ side: 'bottom' }} alignContent="between">
        <Text>
          {notification.message}

          <Anchor label="View" />
        </Text>
        <Text color="black-tint-40" wordBreak="keep-all">
          {readableTimeAgo(notification.created_at)}
        </Text>
      </Box>
      <Box>
        <Link href="/account">
          <Anchor href="/account" label={notification.associated_material_id} />
        </Link>
      </Box>
    </Box>
  )
}

export default Notification
