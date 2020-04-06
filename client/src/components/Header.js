import React from 'react';
import { Anchor, Box, Header, Nav, ResponsiveContext } from 'grommet';
import styled from 'styled-components';

export default function() {
  const size = React.useContext(ResponsiveContext);

  return (
    <Header
      background="brand"
      pad="medium"
      border={[{ size: 'medium', side: 'bottom', color: '#F3E502' }]}
      justify="center"
    >
      <Box
        direction="row"
        width={{ max: size == 'large' ? 'xxlarge' : 'full' }}
        fill="horizontal"
        justify="between"
      >
        <Box direction="row" align="center" gap="small">
          <Anchor color="white" href="#">
            Bio Resources Portal
          </Anchor>
        </Box>

        <Nav direction="row" gap={size == 'large' ? 'xlarge' : 'medium'}>
          <Anchor color="white" href="#" label="Search" />
          <Anchor color="white" href="#" label="List Resource" />
          <Anchor color="white" href="#" label="Help" />
          <Anchor color="white" href="#" label="My Account" />
        </Nav>
      </Box>
    </Header>
  );
}
