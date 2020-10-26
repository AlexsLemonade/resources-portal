import React from 'react'
import { Box } from 'grommet'
import styled from 'styled-components'

const LemonWrapper = styled(Box)`
  transform: rotate(-35deg);
`

export const Loader = () => {
  return (
    <Box>
      <Box fill justify="center" align="center" pad="xlarge">
        <Box round="medium" justify="center" align="center" pad="large">
          <LemonWrapper margin={{ bottom: 'medium' }}>
            <Box
              animation={{ type: 'jiggle', size: 'medium', duration: 400 }}
              background="alexs-lemon"
              border={{ size: 'xsmall', color: 'alexs-lemon' }}
              round="20px 140px 40px 140px"
              width="60px"
              height="60px"
            />
          </LemonWrapper>
        </Box>
      </Box>
    </Box>
  )
}
