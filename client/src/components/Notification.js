import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import Link from 'next/link'

const readableTimeAgo = (time) => {
  const oneDay = 24 * 60 * 60 * 1000
  const date = new Date(time)
  const today = new Date()
  const yearsAgo = today.getFullYear() - date.getFullYear()
  if (yearsAgo > 0) return `${yearsAgo} years ago`
  const daysAgo = Math.round(Math.abs((date - today) / oneDay))
  return daysAgo > 0 ? `${daysAgo} days ago` : 'today'
}

const getLink = (linkType, label, notification) => {
  if (linkType === 'request') {
    const href = `/account/requests/${notification.material_request.id}`
    return (
      <Link href={href} key={1}>
        <Anchor href="#" label={label || 'request'} />
      </Link>
    )
  }
  if (linkType === 'material_name') {
    const href = `/resources/${notification.material.id}`
    return (
      <Link href={href} key={2}>
        <Anchor href="#" label={label || notification.material.title} />
      </Link>
    )
  }
  if (linkType === 'organization_name') {
    const href = `/account/teams/${notification.organization.id}`
    return (
      <Link href={href} key={3}>
        <Anchor href="#" label={label || notification.organization.name} />
      </Link>
    )
  }

  return <></>
}

// This interprets the links present in the notification text.
// These links are in the form [link_type](link_text).
export const createNotificationLinks = (notification) => {
  const re = /\[.*?\]\(.*?\)/g
  const paren = /\(.*?\)/g
  const brack = /\[.*?\]/g

  const message = notification.text_body

  const termsToReplace = message.match(re)
  const remainingText = message.split(re)

  const links = termsToReplace.map((term) => {
    const linkType = term.match(brack)[0].replace('[', '').replace(']', '')
    const linkText = term.match(paren)[0].replace('(', '').replace(')', '')
    return getLink(linkType, linkText, notification)
  })

  const notificationArray = []
  let i
  for (i = 0; i < links.length; i += 1) {
    notificationArray.push(remainingText[i])
    notificationArray.push(links[i])
  }

  notificationArray.push(remainingText[i])

  return notificationArray
}

export const Notification = ({ notification }) => {
  const notificationText = createNotificationLinks(notification)

  return (
    <Box round="medium" elevation="1" fill="horizontal" pad="medium">
      <Box direction="row" border={{ side: 'bottom' }} alignContent="between">
        <Text wordBreak="keep-all">{notificationText}</Text>
        <Text textAlign="end" color="black-tint-40" wordBreak="keep-all">
          {readableTimeAgo(notification.created_at)}
        </Text>
      </Box>
      <Box direction="row" gap="small">
        <Link href="/account">
          <Anchor href="/account" label={notification.organization.name} />
        </Link>
        <Box
          round
          width="7px"
          height="7px"
          background="brand"
          alignSelf="center"
        />
        <Link href="/account">
          <Anchor href="/account" label={notification.material.title} />
        </Link>
      </Box>
    </Box>
  )
}

export default Notification
