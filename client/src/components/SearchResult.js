import { Box, Anchor, Button, Heading, Text, Paragraph } from 'grommet';
import styled from 'styled-components';
// import ResourceTypeIcon from '../images/resource-type.svg';
// import OrganismIcon from '../images/organism.svg';

function SearchResult({ data, fields, className }) {
  return (
    <Box
      border={true}
      pad="large"
      className={className}
      margin={{ bottom: 'large' }}
    >
      <Box
        direction="row"
        justify="between"
        align="center"
        border={[{ side: 'bottom' }]}
        margin={{ bottom: 'medium' }}
        pad={{ bottom: 'medium' }}
      >
        <div>
          <Heading level="3" margin={{ top: '0', bottom: 'small' }}>
            <Anchor href="#" label={data.title} />
          </Heading>
          <Text margin={{ right: 'large' }}>[i] {data.category}</Text>

          <Text>[i] {data.additional_metadata.organism}</Text>
        </div>
        <div>
          <Button label="View Resource" primary />
        </div>
      </Box>
      <Box>
        {fields.map(({ label, value }) => (
          <SearchResultField key={label}>
            <Text weight="bold">{label}</Text>
            <br />
            <Text>{value}</Text>
          </SearchResultField>
        ))}
        <PublicationField data={data} />
        <RequestRequirementsField data={data} />
      </Box>
    </Box>
  );
}
SearchResult = styled(SearchResult)`
  box-shadow: 0 2px 18px 1px rgba(0, 0, 0, 0.1);
`;

export default SearchResult;

const SearchResultField = styled.div`
  margin-bottom: ${({ theme }) => theme.global.edgeSize.small};
`;

function PublicationField({ data }) {
  return (
    <SearchResultField>
      <Text weight="bold">Publication</Text>
      <br />
      <Text>
        <Anchor href="#" label={data.additional_metadata.publication_title} />
      </Text>
    </SearchResultField>
  );
}

function RequestRequirementsField({ data }) {
  return (
    <SearchResultField>
      <Text weight="bold">Request Requirements</Text>
      <br />
      <Text>Needs MTA</Text>
    </SearchResultField>
  );
}
