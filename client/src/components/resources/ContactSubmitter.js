import React from 'react'
import { Anchor, Box, Text } from 'grommet'

export const ContactSubmitter = ({ resource }) => {
  // check if logged in
  // TODO: authenticate calls
  const { contact_user: contactUser } = resource

  return (
    <Box>
      <Text>
        Contact {contactUser.full_name} with questions about the resource.
      </Text>
      <Box margin={{ vertical: 'medium' }}>
        <Text weight="bold">Email</Text>
        <Anchor
          label={contactUser.email}
          href={`mailto:${contactUser.email}`}
        />
      </Box>
    </Box>
  )
}
