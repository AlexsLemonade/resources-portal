import * as React from 'react';
import { Grommet, List } from 'grommet';
import { storiesOf } from '@storybook/react';

import DropZone from './DropZone'
import theme from '../theme';

storiesOf('DropZone', module).add('default', () => {
  return (
    <Grommet theme={theme}>
      <DropZone
        fileTypes={['pdf']}
        onDrop={files => console.log(files)}
      />
    </Grommet>
  );
});

storiesOf('DropZone', module).add('View Files', () => {
  const [files, setFiles] = React.useState([])
  return (
    <Grommet theme={theme}>
      <List
        primarKey="name"
        data={files}
        margin="small"
        onClickItem={ event  => {
          const { item } = event
          const newFiles = files.filter(f => f.name !== item.name)
          setFiles(newFiles)
        }}
      />
      <DropZone
        fileTypes={['pdf']}
        onDrop={files => {
          setFiles(files)
        }}
      />
    </Grommet>
  )
})
