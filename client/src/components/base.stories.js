import * as React from 'react'
import { Grommet, Box, Button, Tabs, Tab, Paragraph } from 'grommet'
import { storiesOf } from '@storybook/react'

import theme from '../theme'

storiesOf('Button', module).add('primary', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="medium">
        <Box align="center" pad="large" gap="large">
          <Button label="Primary" primary />
          <Button label="Primary Disabled" primary disabled />
        </Box>
      </Box>
    </Grommet>
  )
})

storiesOf('Button', module).add('secondary', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="medium">
        <Box align="center" pad="large" gap="large">
          <Button label="Default" />
          <Button label="Default Disabled" disabled />
        </Box>
      </Box>
    </Grommet>
  )
})

storiesOf('Tabs', module).add('3 tabs', () => {
  return (
    <Grommet theme={theme}>
      <Tabs>
        <Tab title="Resource Details">
          <Box alvign="center" pad="large" gap="large">
            <Paragraph>This is the resource details tab.</Paragraph>
          </Box>
        </Tab>
        <Tab title="Publication Information">
          <Box alvign="center" pad="large" gap="large">
            <Paragraph>This is the Publication Information tab.</Paragraph>
          </Box>
        </Tab>
        <Tab title="Contact Submitter">
          <Box alvign="center" pad="large" gap="large">
            <Paragraph>This is the contact submitter tab.</Paragraph>
          </Box>
        </Tab>
      </Tabs>
    </Grommet>
  )
})

storiesOf('Tabs', module).add('4 Tabs', () => {
  return (
    <Grommet theme={theme}>
      <Tabs>
        <Tab title="Resource Details">
          <Box alvign="center" pad="large" gap="large">
            <Paragraph>This is the resource details tab.</Paragraph>
          </Box>
        </Tab>
        <Tab title="Publication Information">
          <Box alvign="center" pad="large" gap="large">
            <Paragraph>This is the publication information tab.</Paragraph>
          </Box>
        </Tab>
        <Tab title="Contact Submitter">
          <Box alvign="center" pad="large" gap="large">
            <Paragraph>This is the contact submitter tab.</Paragraph>
          </Box>
        </Tab>
        <Tab title="Request Requirements">
          <Box alvign="center" pad="large" gap="large">
            <Paragraph>This is the request requirements tab.</Paragraph>
          </Box>
        </Tab>
      </Tabs>
    </Grommet>
  )
})
