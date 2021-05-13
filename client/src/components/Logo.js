import React from 'react'
import { Box, Text } from 'grommet'
import Logo from '../images/alsf-logo.svg'
import LogoBlue from '../images/alsf-blue.svg'

export default () => {
  const [scrolled, setScrolled] = React.useState(false)
  const margin = scrolled ? 0 : 38

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 0 && !scrolled) setScrolled(true)
      if (window.pageYOffset === 0 && scrolled) setScrolled(false)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      margin={{ bottom: `-${margin}px` }}
    >
      <Box width="91px">
        {!scrolled && (
          <Box animation={{ type: 'fadeIn', duration: 250 }}>
            <Logo />
          </Box>
        )}
        {scrolled && (
          <Box
            animation={{ type: 'fadeIn', duration: 250 }}
            background="alexs-lemonade"
            pad="small"
            margin={{ vertical: '19px' }}
          >
            <LogoBlue />
          </Box>
        )}
      </Box>
      <Text serif size="large" color="white" margin={{ bottom: `${margin}px` }}>
        CCRR Portal
      </Text>
    </Box>
  )
}
