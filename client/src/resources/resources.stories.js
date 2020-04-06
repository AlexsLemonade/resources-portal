import * as React from 'react';
import { Grommet, Box } from 'grommet';
import { storiesOf } from '@storybook/react';
import theme from '../theme';
import { Mappings, SearchResult, ResourceDetails } from './index';

export function formatSentenceCase(str) {
  if (!str) return '';

  const tmpStr = str.toLowerCase().replace(/_/g, ' ');
  return tmpStr.charAt(0).toUpperCase() + tmpStr.slice(1);
}

for (let key of Object.keys(Mappings)) {
  storiesOf(`${formatSentenceCase(key)}`, module)
    .add('SearchResult', () => {
      return (
        <Grommet theme={theme}>
          <Box pad="xlarge">
            <SearchResult resource={data[key]} />
            <SearchResult resource={data[key]} />
          </Box>
        </Grommet>
      );
    })
    .add('Details', () => (
      <Grommet theme={theme}>
        <Box pad="xlarge">
          <ResourceDetails resource={data[key]} />
        </Box>
      </Grommet>
    ));
}

const data = {
  DATASET: {
    title: 'Zebrafish Dataset',
    category: 'DATASET',
    id: 'd1686a6c-7d7d-4e90-9c6c-9be541d5074f',
    url: '',
    contact_user: '10000000-0f5a-4165-b518-b2386a753d6f',
    organization_id: '10000000-10d9-4e4f-8fb6-d18cb8f5392b',
    additional_metadata: {
      title: 'Zebrafish Analyis',
      accession: 'GSE24528',
      description: 'Data collected from genetically modified zebrafish.',
      organism: 'Danio rerio',
      number_samples: '15',
      technology: 'R-readable array',
      platform: 'Amazon s3 Database',
      contact_name: 'Prim Proffer',
      contact_email: 'pprof@harvard.edu',
      publication_title: 'Data collected from genetically modified zebrafish',
      pre_print_doi: '10.1109/5.771073',
      pre_print_title: 'Proposal for Data Collection from Zebrafish',
      citation:
        'Proffer, Prim. "Data collected from genetically modified zebrafish". March 15, 2020.',
      additional_info: 'This paper was co-authored by Postworth Docktor.'
    },
    created_at: '2020-01-30 16:12:25-07',
    mta_s3_url: 'https://bucket-name.s3.region.amazonaws.com/keyname',
    needs_irb: 'true',
    needs_mta: 'true',
    pubmed_id: 'https://www.ncbi.nlm.nih.gov/pubmed/32223680',
    updated_at: '2020-01-30 16:12:25-07'
  }
};
