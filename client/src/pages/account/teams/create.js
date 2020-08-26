import React from 'react'
import {
  Box,
  Button,
  CheckBox,
  FormField,
  TextInput,
  Text,
  TextArea
} from 'grommet'
import Link from 'next/link'
import { DrillDownNav } from 'components/DrillDownNav'
import { HeaderRow } from 'components/HeaderRow'

const TeamCreate = () => {
  return (
    <DrillDownNav title="Create Team" linkBack="/account/teams">
      <Box>
        <FormField label="Name your team">
          <TextInput />
        </FormField>
        <FormField label="Description">
          <TextArea />
        </FormField>
      </Box>
      <Box>
        <HeaderRow label="Add Members" />
        <Text>
          All members can add, edit, and archive resources and respond to
          request requirements. Only the owner (you) can add new members and
          remove resources.
        </Text>
        <FormField label="Email">
          <TextInput />
        </FormField>
        <Button plain label="Invite More" />
        <Box pad={{ vertical: 'medium' }} align="start">
          <Button primary label="Add Members" />
        </Box>
      </Box>
      <Box>
        <HeaderRow label="Link Grants" />
        <Text>
          Members of your team may only add resources and manage requests
          associated with a particular grant. Select the grant(s) below to
          associate with this team.
        </Text>
        <Text weight="bold" margin={{ vertical: 'small' }}>
          Grants awarded to you (choose as many as appropriate)
        </Text>
        <CheckBox label="Grant 1" />
        <CheckBox label="Grant 2" />
      </Box>
      <Box
        margin={{ vertical: 'large' }}
        justify="end"
        gap="large"
        direction="row"
      >
        <Link href="/account/teams">
          <Button label="Cancel" />
        </Link>
        <Button primary label="Create Team" />
      </Box>
    </DrillDownNav>
  )
}

export default TeamCreate
