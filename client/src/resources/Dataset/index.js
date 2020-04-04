import { Box, Anchor, Button, Heading, Text, Paragraph } from 'grommet';
import styled from 'styled-components';
import SearchResultComponent from '../../components/SearchResult';

function SearchResult({ data, className }) {
  return (
    <SearchResultComponent
      data={data}
      className={className}
      fields={[
        {
          label: 'Description',
          value: data.additional_metadata.description
        }
      ]}
    />
  );
}

function Details({ data }) {
  return <h1>Dataset details</h1>;
}

export default {
  SearchResult,
  Details
};
