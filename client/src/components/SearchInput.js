import React from 'react'
import { Box, Button, TextInput } from 'grommet'

export default function SearchInput({ query, size = 'medium' }) {
  // TODO: add form and use onSubmit
  return (
    <Box direction="row">
      <TextInput value={query} size={size} />
      <Button
        label="Search"
        size={size}
        width="96px"
        margin={{ left: 'medium' }}
      />
    </Box>
  )
}
