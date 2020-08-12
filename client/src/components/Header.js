import { Anchor, Box, Header, Nav, ResponsiveContext } from 'grommet'
import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'
import { useUser } from '../hooks/useUser'
import { LoginButton } from './LoginButton'
import LogoSvg from './logo.svg'
import SignInModal from './SignInModal'

export default function ResourcesHeader({ className }) {
  const size = React.useContext(ResponsiveContext)
  const [showing, setShowing] = React.useState(false)
  const { isLoggedIn } = useUser()

  let orcidPrefix = ''
  if (process.env.IS_DEVELOPMENT) {
    orcidPrefix = 'https://sandbox.orcid.org/'
  } else {
    orcidPrefix = 'https://orcid.org/'
  }

  const orcidUrl = `${orcidPrefix}oauth/authorize?client_id=${process.env.ORCID_CLIENT_ID}&response_type=code&scope=/authenticate&redirect_uri=${process.env.CLIENT_HOST}`

  return (
    <Header
      className={className}
      background="brand"
      pad="medium"
      border={[{ size: 'medium', side: 'bottom', color: '#F3E502' }]}
      justify="center"
      margin={{ bottom: '2rem' }}
    >
      <Box
        direction="row"
        width={{ max: size === 'large' ? 'xxlarge' : 'full' }}
        fill="horizontal"
        justify="between"
      >
        <Box direction="row" align="center" gap="small">
          <Link href="/">
            <Anchor color="white" href="#">
              <Logo />
            </Anchor>
          </Link>
        </Box>

        <Nav
          direction="row"
          gap={size === 'large' ? 'xlarge' : 'medium'}
          align="center"
        >
          <Link href="/search">
            <Anchor color="white" href="#" label="Search" />
          </Link>
          <Link href="/resources">
            <Anchor color="white" href="#" label="List Resource" />
          </Link>
          <Anchor color="white" href="#" label="Help" />
          {isLoggedIn && (
            <Link href="/account">
              <Anchor color="white" href="#" label="My Account" />
            </Link>
          )}
          {!isLoggedIn && (
            <Box>
              <LoginButton onClick={() => setShowing(true)} />
              <SignInModal showing={showing} setShowing={setShowing} />
            </Box>
          )}
        </Nav>
      </Box>
    </Header>
  )
}

const Logo = styled(LogoSvg)`
  margin-bottom: -56px;
`
