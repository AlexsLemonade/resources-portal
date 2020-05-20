import * as React from 'react'
import { storiesOf } from '@storybook/react'
import {
  Grommet,
  Box,
  Button,
  Tabs,
  Tab,
  Paragraph,
  FormField,
  Select,
  TextInput,
  RadioButton,
  RadioButtonGroup,
  CheckBox,
  Heading
} from 'grommet'

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

storiesOf('Forms Inputs', module).add('Select', () => {
  const options = [...Array(25).keys()].map((o) => `Option ${o + 1}`)
  const [value, setValue] = React.useState('Option 1')
  return (
    <Grommet theme={theme}>
      <Box direction="row" justify="center">
        <Box pad="medium" direction="row" justify="between" width="large">
          <FormField label="Example" margin="medium" htmlFor="select1">
            <Select
              options={options}
              value={value}
              placeholder="Placeholder"
              dropHeight="medium"
              onChange={({ option }) => setValue(option)}
            />
          </FormField>
          <FormField
            label="Disabled Example"
            margin="medium"
            htmlFor="selecti2"
            disabled
          >
            <Select
              options={options}
              value={value}
              placeholder="Disabled Placeholder"
              onChange={({ option }) => setValue(option)}
              disabled
            />
          </FormField>
        </Box>
      </Box>
    </Grommet>
  )
})

storiesOf('Forms Inputs', module).add('Radio Buttons', () => {
  const [selected, setSelected] = React.useState()
  const [groupSelected, setGroupSelected] = React.useState()
  return (
    <Grommet theme={theme}>
      <Box align="start" pad="large" gap="large">
        <RadioButton
          label="option 1"
          name="name"
          value="option 1"
          checked={selected === 'option 1'}
          onChange={(event) => setSelected(event.target.value)}
        />
      </Box>
      <Box align="start" pad="large" gap="large">
        <RadioButtonGroup
          name="doc"
          options={['one group', 'two group']}
          value={groupSelected}
          onChange={(event) => setGroupSelected(event.target.value)}
        />
      </Box>
    </Grommet>
  )
})

storiesOf('Forms Inputs', module).add('Checkboxes', () => {
  const [option, setOption] = React.useState(false)
  const [another, setAnother] = React.useState(false)
  return (
    <Grommet theme={theme}>
      <Box align="start" pad="large" gap="large">
        <CheckBox
          checked={option}
          label="One Options"
          onChange={(event) => setOption(event.target.checked)}
        />
        <CheckBox
          checked={another}
          label="Another Option"
          onChange={(event) => setAnother(event.target.checked)}
        />
      </Box>
    </Grommet>
  )
})

storiesOf('Forms Inputs', module).add('Textboxes', () => {
  const [text, setText] = React.useState('')
  return (
    <Grommet theme={theme}>
      <Box align="start" pad="large" gap="large">
        <TextInput
          placeholder="Enter your text"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </Box>
    </Grommet>
  )
})

storiesOf('Headings', module)
  .add('Lato (for body)', () => {
    return (
      <Grommet theme={theme}>
        <Box align="center" pad="large">
          {[1, 2, 3, 4, 5].map((level) => (
            <Heading level={level}>
              H{level} Heading {level}
            </Heading>
          ))}
        </Box>
      </Grommet>
    )
  })
  .add('Arvo (for headers)', () => {
    return (
      <Grommet theme={theme}>
        <Box align="center" pad="large">
          {[1, 2, 3, 4, 5].map((level) => (
            <Heading level={level} serif>
              H{level} Heading {level}
            </Heading>
          ))}
        </Box>
      </Grommet>
    )
  })
