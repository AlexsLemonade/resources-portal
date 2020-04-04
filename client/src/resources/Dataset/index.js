import SearchResultComponent from '../../components/SearchResult';
import DetailsTable from '../../components/DetailsTable';

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
  return (
    <DetailsTable
      data={[
        { label: 'Title', value: data.title },
        {
          label: 'Description',
          value: data.additional_metadata.description
        },
        { label: 'Organism', value: data.additional_metadata.organism },
        {
          label: 'Number of Samples',
          value: data.additional_metadata.number_samples
        },
        { label: 'Technology', value: data.additional_metadata.technology },
        { label: 'Platform', value: data.additional_metadata.platform },
        {
          label: 'Additional Information',
          value: data.additional_metadata.additional_info || 'None'
        }
      ]}
    />
  );
}

export default {
  SearchResult,
  Details
};
