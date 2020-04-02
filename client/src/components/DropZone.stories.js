import * as React from 'react';
import { Grommet } from 'grommet';
import { storiesOf } from '@storybook/react';

import DropZone from './DropZone'
import theme from '../theme';

storiesOf('DropZone', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <DropZone
        fileTypes={['pdf']}
      />
    </Grommet>
  );
});
