import React from 'react'
import { Box, Main } from 'grommet'
import Header from './Header'
import { Footer } from './Footer'

export const Layout = ({ children }) => {
  return (
    <Box height={{ min: '100vh' }}>
      <Box gridArea="header" margin={{ bottom: 'xlarge' }}>
        <Header />
      </Box>
      <Main width="xxlarge" alignSelf="center" overflow="visible">
        {children}
      </Main>
      <Footer />
    </Box>
  )
}

export default Layout
