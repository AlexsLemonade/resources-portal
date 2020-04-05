import { Box, Heading, Button, Anchor, Text } from 'grommet';
import Link from 'next/link';
import styled from 'styled-components';

export default function ListResource({}) {
  return (
    <>
      <Box margin={{ bottom: 'large' }}>
        <Heading level="4">List Resources</Heading>
        <p>
          We recommend you to list your resource in a repository specific to
          your resource and import them here.
        </p>
        <p>
          Using these repositories will reduce the administrative burden on your
          and your staff. It also increases discoverability and citations.
        </p>
      </Box>

      <p>Here are a few recommended repositories to get you started:</p>

      <Box align="center" margin={{ bottom: 'xlarge' }}>
        <Heading level="3">
          Already listed your resource in a repository?
        </Heading>
        <Link href="/resources/import">
          <Button label="Import" primary />
        </Link>
      </Box>

      <MessageBox pad="medium" border={true} alignSelf="center">
        <Text>
          Repository for your resource doesn’t exist? Can’t list your resource
          in a repository yet?{' '}
          <Link href="/resources/list">
            <Anchor label="List with us" />
          </Link>
        </Text>
      </MessageBox>
    </>
  );
}

const MessageBox = styled(Box)`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  max-width: 536px;
`;
