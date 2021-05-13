import React from 'react'
import { Box, Header, Nav, ResponsiveContext } from 'grommet'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { useAlertsQueue } from 'hooks/useAlertsQueue'
import { AlertsWithQueue } from 'components/Alert'
import Link from 'components/Link'
import Logo from 'components/Logo'

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
                <Logo />
              </Link>
            </Box>
            <Nav
              direction="row"
              gap={size === 'large' ? 'xlarge' : 'medium'}
              align="center"
            >
              <Link color="white" href="/search" label="Search" />
              <Link color="white" href="/resources" label="Add Resource" />
              <Link color="white" href="/help" label="Help" />
              <HeaderAccountLink />
            </Nav>
          </Box>
        </Header>
      </FixedBox>
    </Box>
  )
}
