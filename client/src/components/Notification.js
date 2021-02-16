import React from 'react'
import { Box, Markdown, Text } from 'grommet'
import Link from 'components/Link'
import { useUser } from 'hooks/useUser'

export const Notification = ({ notification }) => {
  const { user } = useUser()
  const { organization: team } = notification
  const showOrganizationLink = team && team.members.includes(user.id)

  return (
    <Box round="medium" fill="horizontal" pad="medium">
      <Box
        direction="row"
        border={{ side: 'bottom' }}
        pad={{ bottom: 'small' }}
        margin={{ bottom: 'small' }}
        justify="between"
      >
        <Markdown
          options={{
            wrapper: Box,
            overrides: { a: { component: Link } }
          }}
        >
          {notification.markdown || ''}
        </Markdown>
        <Text italic textAlign="end" color="black-tint-40" wordBreak="keep-all">
          {notification.human_readable_date}
        </Text>
      </Box>
      <Box direction="row">
        {showOrganizationLink && (
          <Link
            href={`/account/teams/${notification.organization.id}`}
            label={notification.organization.name}
          />
        )}
        {notification.material && showOrganizationLink && (
          <Box
            round
            width="7px"
            height="7px"
            background="brand"
            alignSelf="center"
            margin="small"
          />
        )}
        {notification.material && (
          <Link
            href={`/resources/${notification.material.id}`}
            label={notification.material.title}
          />
        )}
      </Box>
    </Box>
  )
}

export default Notification
