import * as React from 'react';
import { Grommet, Box } from 'grommet';
import { storiesOf } from '@storybook/react';

import DetailsTable from './DetailsTable';
import theme from '../theme';

storiesOf('DetailsTable', module).add('default', () => {
  const DATA = [
    { name: 'Alan', value: 20 },
    { name: 'Bryan', value: 30 },
    { name: 'Chris', value: 40 }
  ];

  return (
    <Grommet theme={theme}>
      <Box align="center" pad="large">
        <DetailsTable data={DATA} />
      </Box>
    </Grommet>
  );
});
