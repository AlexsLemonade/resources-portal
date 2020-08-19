import { Anchor, Box, Header, Nav, ResponsiveContext } from 'grommet'
import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'
import { HeaderAccountLink } from './HeaderAccountLink'
import LogoSvg from './logo.svg'

export default function ResourcesHeader({ className }) {
  const size = React.useContext(ResponsiveContext)

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
            <Anchor color="white" href="#" label="Add Resource" />
          </Link>
          <Anchor color="white" href="#" label="Help" />
          <HeaderAccountLink />
        </Nav>
      </Box>
    </Header>
  )
}

const Logo = styled(LogoSvg)`
  margin-bottom: -56px;
`
