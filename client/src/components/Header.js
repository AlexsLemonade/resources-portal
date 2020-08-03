import React from 'react'
import { Anchor, Box, Header, Nav, ResponsiveContext } from 'grommet'
import styled from 'styled-components'
import Link from 'next/link'
import LogoSvg from './logo.svg'
import Login from './Login'
import LoginModal from './LoginModal'

export default function ResourcesHeader({ className }) {
  const size = React.useContext(ResponsiveContext)
  const [showing, setShowing] = React.useState(false)

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
          <Anchor color="white" href="#" label="My Account" />
          <Login onClick={() => setShowing(true)}/>
          <LoginModal showing={showing} setShowing={setShowing}/>
        </Nav>
      </Box>
    </Header>
  )
}

const Logo = styled(LogoSvg)`
  margin-bottom: -56px;
`
