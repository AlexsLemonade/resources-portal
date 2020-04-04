import Head from 'next/head';

import SearchInput from '../components/SearchInput';
import styled from 'styled-components';

import { Box, Button, Grid, Text } from 'grommet';
import { useLoader } from '../common/hooks';
import { search } from '../common/api';
import { SearchResult } from '../resources';
import { useRouter } from 'next/router';
export default function Search({}) {
  const router = useRouter();
  // check for the parameter `ref=search` to ensure that the previous page was the search
  const { q: query } = router.query;
  const { isLoading, data } = useLoader(() => search({ query }));

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
          {!isLoading &&
            data.map(result => (
              <SearchResult
                key={result.id}
                category={result.category}
                data={result}
              />
            ))}
        </Box>
      </Grid>
    </main>
  );
}

const SearchInputContainer = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 752px;
  margin-bottom: ${({ theme }) => theme.global.edgeSize.xlarge};
`;
