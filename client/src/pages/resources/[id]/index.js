import { getResourceDetails } from '../../../common/api';
import { useRouter } from 'next/router';
import { ResourceDetails } from '../../../resources';
import { Box, Heading, Anchor, Text, Button } from 'grommet';
import Link from 'next/link';

const ResourceDetailsPage = ({ resource }) => (
  <>
    <Box
      direction="row"
      justify="between"
      align="center"
      margin={{ bottom: 'large' }}
    >
      <div>
        <Heading level="5" margin={{ top: '0', bottom: 'small' }}>
          <Link href="/resources/[id]" as={`/resources/${resource.id}`}>
            <Anchor label={resource.title} />
          </Link>
        </Heading>
        <Text margin={{ right: 'large' }}>[i] {resource.category}</Text>

        <Text>[i] {resource.additional_metadata.organism}</Text>
      </div>
      <div>
        <Link
          href="/resources/[id]/request"
          as={`/resources/${resource.id}/request`}
        >
          <Button label="Request" primary />
        </Link>
      </div>
    </Box>

    <div>
      <Heading level="3">Resource Details</Heading>

      <ResourceDetails resource={resource} />
    </div>
  </>
);
ResourceDetailsPage.getInitialProps = async ({ query }) => {
  const resource = await getResourceDetails({ id: query.id });
  return { resource };
};
export default ResourceDetailsPage;
