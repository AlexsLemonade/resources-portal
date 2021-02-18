import { Anchor, Box, Header, Nav, ResponsiveContext } from 'grommet'
import Link from 'next/link'
import React from 'react'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { AlertsWithQueue } from 'components/Alert'
import LogoSvg from '../images/logo.svg'

const HeaderAccountLink = dynamic(
  () => import('components/HeaderAccountLink'),
  {
    ssr: false
  }
)

const FixedBox = styled(Box)`
  position: fixed;
  width: 100%;
  z-index: 1;
  box-shadow: 0px 2px 5px 5px #fdfdfd;
`

const Logo = styled(LogoSvg)`
  margin-bottom: -56px;
`

export default function ResourcesHeader({ className }) {
  const size = React.useContext(ResponsiveContext)
  const queue = useAlertsQueue()
  return (
    <Box height={queue.alerts.length > 0 ? '201px' : '80px'}>
      <FixedBox background="white">
        <AlertsWithQueue queue={queue} />
        <Header
          className={className}
          background="brand"
          pad="small"
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
                <Anchor color="white" href="/search" label="Search" />
              </Link>
              <Link href="/resources">
                <Anchor color="white" href="/resources" label="Add Resource" />
              </Link>
              <Anchor color="white" href="/help" label="Help" />
              <HeaderAccountLink />
            </Nav>
          </Box>
        </Header>
      </FixedBox>
    </Box>
  )
}
