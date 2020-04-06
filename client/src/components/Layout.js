import React from 'react';
import Header from './Header';
import styled from 'styled-components';
import { Box, Main } from 'grommet';

export default function Layout({ children }) {
  return (
    <Box height={{ min: '100vh' }}>
      <Box gridArea="header" margin={{ bottom: 'xlarge' }}>
        <Header />
      </Box>
      <Main width="xlarge" alignSelf="center">
        {children}
      </Main>
    </Box>
  );
}
