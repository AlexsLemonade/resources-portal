import React from 'react';
import { Box, Button, TextInput } from 'grommet';
import styled from 'styled-components';

export default function SearchInput({ query, onSubmit, size = 'medium' }) {
  // TODO: add form and use onSubmit
  return (
    <Box direction="row">
      <TextInput value={query} size={size} />
      <SearchButton label="Search" size={size} />
    </Box>
  );
}

const SearchButton = styled(Button)`
  margin-left: ${({ theme }) => theme.global.edgeSize.medium};
  width: 96px;
`;
