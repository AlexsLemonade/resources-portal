import React from 'react';
import { Anchor, Box, Header, Nav, ResponsiveContext } from 'grommet';
import styled from 'styled-components';
import LogoSvg from './logo.svg';

function ResourcesHeader({ className }) {
  const size = React.useContext(ResponsiveContext);

  return (
    <Header
      className={className}
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
            <Logo />
          </Anchor>
        </Box>

        <Nav
          direction="row"
          gap={size == 'large' ? 'xlarge' : 'medium'}
          align="center"
        >
          <Anchor color="white" href="#" label="Search" />
          <Anchor color="white" href="#" label="List Resource" />
          <Anchor color="white" href="#" label="Help" />
          <Anchor color="white" href="#" label="My Account" />
        </Nav>
      </Box>
    </Header>
  );
}

ResourcesHeader = styled(ResourcesHeader)`
  margin-bottom: 2rem;
`;

export default ResourcesHeader;

const Logo = styled(LogoSvg)`
  margin-bottom: -56px;
`;
