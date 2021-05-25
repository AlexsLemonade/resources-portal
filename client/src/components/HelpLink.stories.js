import * as React from 'react'
import { Grommet, Box, Paragraph, Text } from 'grommet'
import { storiesOf } from '@storybook/react'
import HelpLink from 'components/HelpLink'
import theme from '../theme'

storiesOf('Help Link', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box pad="medium" direction="row">
        <HelpLink path="demo">
          <Paragraph>This is a Paragraph</Paragraph>
        </HelpLink>
      </Box>
      <Box pad="medium">
        <HelpLink path="demo">
          <Text>This is a Text</Text>
        </HelpLink>
      </Box>
      <Box pad="medium">
        <HelpLink>
          <Text>
            This has no href so it wont render the icon ( for dynamic use )
          </Text>
        </HelpLink>
      </Box>
      <Box pad="medium">
        <HelpLink path="demo" label="Using the label attribute" />
      </Box>
    </Grommet>
  )
})
