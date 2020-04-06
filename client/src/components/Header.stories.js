import * as React from 'react';
import { Grommet } from 'grommet';
import { storiesOf } from '@storybook/react';

import Header from './Header';
import theme from '../theme';

storiesOf('Header', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Header />
    </Grommet>
  );
});
