import Head from 'next/head';

import SearchInput from '../components/SearchInput';
import styled from 'styled-components';

import { Box, Grid } from 'grommet';
import { search } from '../common/api';
import { SearchResult } from '../resources';

export default function Search({ results }) {
  return (
    <main>
      <SearchInputContainer>
        <SearchInput />
      </SearchInputContainer>

      <Grid
        fill
        rows={['auto', 'flex']}
        columns={['auto', 'flex']}
        areas={[
          { name: 'header', start: [1, 0], end: [1, 1] },
          { name: 'sidebar', start: [0, 0], end: [0, 1] },
          { name: 'main', start: [1, 1], end: [1, 1] }
        ]}
      >
        <Box
          gridArea="header"
          direction="row"
          align="center"
          justify="between"
          pad="small"
        >
          TODO: Page size controls
        </Box>
        <Box gridArea="sidebar" width="medium" pad="small">
          TODO: Search filters
        </Box>
        <Box gridArea="main" pad="small">
          {results.map(result => (
            <SearchResult key={result.id} resource={result} />
          ))}
        </Box>
      </Grid>
    </main>
  );
}
Search.getInitialProps = async ({ query }) => {
  // TODO: add additional filter parameters here
  const results = await search({ query: query.q });
  return { results };
};

const SearchInputContainer = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 752px;
  margin-bottom: ${({ theme }) => theme.global.edgeSize.xlarge};
`;
