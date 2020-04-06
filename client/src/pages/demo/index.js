import react from 'react'
import {
  Box,
  Button,
  Paragraph,
  Main,
  Stack,
  Select,
  FormField,
  Heading,
  Form,
  TextInput,
  TextArea
} from 'grommet'

const data = {
  steps: ['Source Details', 'Request Requirements', 'Review and Publish'],
  grants: [
    'Young Investigator-4353',
    'Young Investigator-1111',
    'Another options'
  ],
  resourceTypes: ['Protocol', 'Other Thing', 'Another One']
}

const Demo = () => {
  // form state
  const [grant, setGrant] = React.useState(data.grants[0])
  const [resourceType, setResourceType] = React.useState(data.resourceTypes[0])

  return (
    <Main pad="large" align="center" width={{ max: 728 }}>
      <Box align="start" width="large">
        <Heading level="1">List A Resource</Heading>
      </Box>
      <Form>
        <Box
          gap="large"
          direction="row"
          justify="center"
          align="center"
          width="large"
          pad={{
            veritcal: 'small',
            horizontal: 'medium'
          }}
        >
          <FormField label="Grant ID">
            <Select
              options={data.grants}
              value={grant}
              onChange={({ option }) => setGrant(option)}
            />
          </FormField>
          <FormField label="Resource Type">
            <Select
              options={data.resourceTypes}
              value={resourceType}
              onChange={({ option }) => setResourceType(option)}
            />
          </FormField>
        </Box>
        <Box justify="start" width="large" elevation="small" pad="large">
          <Paragraph level="5">Resource Details</Paragraph>
          <FormField
            label="Protocol Name"
            help="This is help"
            info="this is info"
          >
            <TextInput />
          </FormField>
          <FormField label="Description">
            <TextArea />
          </FormField>
          <FormField
            label="Pubmed ID"
            required={false}
            info="This field is optional."
          >
            <TextInput />
          </FormField>
          <FormField label="Citation" info="How do you want to ">
            <TextArea />
          </FormField>
        </Box>
      </Form>
    </Main>
  )
}

export default Demo
