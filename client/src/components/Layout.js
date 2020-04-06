import React from 'react';
import Header from './Header';
import styled from 'styled-components';

export default function Layout({ children }) {
  return (
    <LayoutContainer>
      <Header />

      <LayoutContent>{children}</LayoutContent>
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const LayoutContent = styled.div`
  max-width: 1175px;
  padding: 0;
  width: 100%;
  flex: 1;

  margin: 1rem auto;
`;
