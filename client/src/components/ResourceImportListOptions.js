import React from 'react'
import { Box, Button, Text, Paragraph } from 'grommet'
import Link from 'components/Link'
import CreateAccountLoginButton from 'components/CreateAccountLoginButton'
import HelpLink from 'components/HelpLink'
import { useUser } from 'hooks/useUser'

export default () => {
  const { isLoggedIn } = useUser()

  return (
    <>
      <Box direction="row" margin={{ vertical: 'large' }}>
        <Box pad={{ vertical: 'medium' }}>
          <HelpLink path="importing-resources">
            <Text serif size="large">
              Import
            </Text>
          </HelpLink>
          <Paragraph margin={{ vertical: 'medium' }}>
            Import your resource if you have already deposited it to a public
            repository.
          </Paragraph>
          <Paragraph margin={{ bottom: 'medium' }}>
            If you have not deposited your resource in a public repository, we
            strongly encourage you to do so whenever possible.
          </Paragraph>
          {isLoggedIn && (
            <Link href="/resources/import">
              <Button label="Import" primary alignSelf="start" />
            </Link>
          )}
        </Box>
        <Box
          background="border-black"
          height="fill"
          margin={{ horizontal: 'xxlarge' }}
          width="5px"
        />
        <Box pad={{ vertical: 'medium' }}>
          <HelpLink path="how-do-i-list-a-resource">
            <Text serif size="large">
              List
            </Text>
          </HelpLink>
          <Paragraph margin={{ vertical: 'medium' }}>
            Repository for your resource doesn’t exist? Can’t list your resource
            in a repository yet? List with us.
          </Paragraph>
          <Paragraph margin={{ bottom: 'medium' }}>
            When you list a resource, you will be responsible for responding to
            requests that are made through the portal.
          </Paragraph>
          {isLoggedIn && (
            <Link href="/resources/list">
              <Button label="List" primary alignSelf="start" />
            </Link>
          )}
        </Box>
      </Box>
      {!isLoggedIn && (
        <Box align="center" pad="large" elevation="medium">
          <Text
            size="medium"
            textAlign="center"
            weight="bold"
            margin={{ bottom: 'medium' }}
          >
            Sign in / Create Account to Import or List Resources
          </Text>
          <CreateAccountLoginButton
            title="Sign in/ Create Account"
            plainButton
          />
        </Box>
      )}
    </>
  )
}
