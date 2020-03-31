import React from 'react';
import { Anchor, Box, Header, Nav } from 'grommet';
import styled from 'styled-components';

export default function() {
  return (
    <Header background="brand" pad="medium">
      <Box direction="row" align="center" gap="small">
        <Anchor color="white" href="#">
          Bio Resources Portal
        </Anchor>
      </Box>
      <Nav direction="row">
        <Anchor color="white" href="#" label="Search" />
        <Anchor color="white" href="#" label="List Resource" />
        <Anchor color="white" href="#" label="Help" />
        <Anchor color="white" href="#" label="My Account" />
      </Nav>
    </Header>
  );
}
