import React from 'react'
import {
  Box,
  Button,
  FormField,
  Image,
  Nav,
  Stack,
  Text,
  TextInput
} from 'grommet'
import styled from 'styled-components'
import Link from 'components/Link'
import Icon from 'components/Icon'

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
      pad={{ top: '100px', bottom: 'xlarge' }}
    >
      <Box direction="row" justify="between" align="end" width="xxlarge">
        <Stack anchor="top-right">
          <Box direction="row" justify="between" align="end" width="xxlarge">
            <Box align="start" margin={{ vertical: 'large' }}>
              <Text>Alex’s Lemonade Stand Foundation for Childhood Cancer</Text>
              <Text>
                111 Presidential Blvd., Suite 203, Bala Cynwyd, PA 19004 USA
              </Text>
              <Text>Phone: 866.333.1213 • Fax: 610.649.3038</Text>
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
                  <Text weight="600">
                    Sign up to get the latest updates from Alex’s Lemonade Stand
                    Foundation{' '}
                  </Text>
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
            margin={{ top: '-45%', left: '25%' }}
            opacity=".1"
            src="/footer-lemon.svg"
          />
        </Stack>
      </Box>
      <Box direction="row" justify="between" width="xxlarge">
        <Box>
          <Nav direction="row" align="center" gap="large">
            <Link href="/terms-of-use" label="Terms of Use" />
            <Link href="/privacy-policy" label="Privacy Policy" />
            <Link
              href="https://help.resources.alexslemonade.org/knowledge"
              label="Help"
            />
          </Nav>
        </Box>
        <Box
          direction="row"
          justify="start"
          gap="medium"
          basis="1/3"
          pad={{ left: 'xlarge' }}
        >
          <Link href="https://twitter.com/alexslemonade">
            <Icon name="Twitter" color="black-tint-40" />
          </Link>
          <Link href="http://www.instagram.com/alexslemonade">
            <Icon name="Instagram" color="black-tint-40" />
          </Link>
          <Link href="http://www.facebook.com/alexslemonade">
            <Icon name="Facebook" color="black-tint-40" />
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
