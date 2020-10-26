import React from 'react'
import { Anchor, Box, Text } from 'grommet'
import { useUser } from 'hooks/useUser'
import { GatedLoginModal } from 'components/modals/GatedLoginModal'

export const ContactSubmitter = ({ resource }) => {
  // check if logged in
  // TODO: authenticate calls
  const { contact_user: contactUser } = resource

  const { isLoggedIn } = useUser()

  return (
    <Box>
      <Text>
        Contact {contactUser.full_name} with questions about the resource.
      </Text>
      <GatedLoginModal title="Please sign in to contact submitter">
        <Box
          margin={{ vertical: 'medium', left: isLoggedIn ? 'none' : 'small' }}
        >
          <Text weight="bold">Email</Text>
          <Anchor
            label={contactUser.email}
            href={`mailto:${contactUser.email}`}
          />
        </Box>
      </GatedLoginModal>
    </Box>
  )
}
