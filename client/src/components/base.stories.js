import * as React from 'react';
import { Grommet, Button, Box } from 'grommet';
import { storiesOf } from '@storybook/react';

import theme from '../theme';

storiesOf('Button', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <Box align="center" pad="large" gap="large">
        <Button label="Primary" primary />
        <Button label="Secondary" />
        <Button label="Default" />
      </Box>
    </Grommet>
  );
});
