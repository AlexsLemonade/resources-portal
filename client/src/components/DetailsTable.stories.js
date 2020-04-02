import * as React from 'react';
import { Grommet, Box } from 'grommet';
import { storiesOf } from '@storybook/react';

import DetailsTable from './DetailsTable';
import theme from '../theme';

storiesOf('DetailsTable', module).add('default', () => {
  const DATA = [
    {
      name: 'Title',
      value: 'Expression analysis of zebrafish melanoma and skin'
    },
    { name: 'Accession', value: 'GSE24528' },
    {
      name: 'Description',
      value:
        'In order to study the effect of transcription factor knockdown, we selectively depleted mRNA products from 483 different genes that are known or predicted to encode transcription factors. We treated Drosophila S2R+ tissue culture cells with double strand RNAs designed to be specific for these loci. Following RNAi treatment, we isolated poly A+ RNA from the cells, and performed stranded high-throughput RNA-Seq analyses to determine knockdown efficiency and propagating transcriptional consequences.'
    },
    { name: 'Organism', value: 'Danio rerio' },
    { name: 'Number of Samples', value: '15' },
    { name: 'Technology', value: 'microarray' },
    {
      name: 'Source Url',
      value: (
        <a href="#">
          https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE24528
        </a>
      )
    }
  ];

  return (
    <Grommet theme={theme}>
      <Box align="center" pad="large">
        <DetailsTable data={DATA} />
      </Box>
    </Grommet>
  );
});
