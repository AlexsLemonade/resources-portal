import React from 'react'
import {
  Anchor,
  Box,
  Button,
  FormField,
  Image,
  Nav,
  Paragraph,
  Stack,
  Text,
  TextInput
} from 'grommet'
import styled from 'styled-components'
import Link from 'next/link'

const NoTouch = styled(Image)`
  pointer-events: none;
`

export const Footer = () => {
  const [email, setEmail] = React.useState('')
  return (
    <Box
      background="gradient-reverse"
      elevation="medium"
      align="center"
      pad={{ vertical: 'xlarge' }}
    >
      <Box direction="row" justify="between" align="end" width="xxlarge">
        <Stack anchor="top-right">
          <Box direction="row" justify="between" align="end" width="xxlarge">
            <Box align="start" margin={{ vertical: 'large' }}>
              <Text color="turteal-shade-40">
                Alex’s Lemonade Stand Foundation for Childhood Cancer
              </Text>
              <Text margin={{ top: 'large' }} color="turteal-shade-40">
                111 Presidential Blvd., Suite 203, Bala Cynwyd, PA 19004 USA
              </Text>
              <Text color="turteal-shade-40">
                Phone: 866.333.1213 • Fax: 610.649.3038
              </Text>
              <Box margin={{ top: 'large' }}>
                <Button primary label="Donate" />
              </Box>
            </Box>
            <Box
              basis="1/3"
              pad={{ left: 'xlarge' }}
              margin={{ vertical: 'large' }}
            >
              <Box align="end">
                <Box>
                  <Paragraph color="turteal-shade-40" fill>
                    Sign up to get the latest updates from Alex’s Lemonade Stand
                    Foundation{' '}
                  </Paragraph>
                </Box>
                <Box
                  fill
                  direction="row"
                  gap="small"
                  align="end"
                  justify="between"
                >
                  <FormField label="Email" margin="none" flex="grow">
                    <TextInput
                      value={email}
                      onChange={({ target: { value } }) => setEmail(value)}
                    />
                  </FormField>
                  <Button primary label="Sign Up" />
                </Box>
              </Box>
            </Box>
          </Box>
          <NoTouch
            margin={{ top: '-25%', left: '25%' }}
            opacity=".1"
            src="/footer-lemon.svg"
          />
        </Stack>
      </Box>
      <Box direction="row" justify="between" width="xxlarge">
        <Box>
          <Nav direction="row" align="center" gap="large">
            <Link href="/terms-of-use">
              <Anchor href="#" label="Terms of Use" />
            </Link>
            <Link href="/privacy-policy">
              <Anchor href="#" label="Privacy Policy" />
            </Link>
            <Anchor href="#" label="Contact" />
            <Anchor href="#" label="Help" />
          </Nav>
        </Box>
        <Box>Waiting on Social Icons</Box>
      </Box>
    </Box>
  )
}

export default Footer
