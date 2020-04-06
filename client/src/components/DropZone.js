import React from 'react'
import { Box, Text, Button, ResponsiveContext } from 'grommet'
import Dropzone from 'react-dropzone'

export default ({ fileTypes = [], multiple = true, onDrop }) => {
  const size = React.useContext(ResponsiveContext)

  return (
    <Dropzone
accept={fileTypes.map((ft) => `.${ft}`)} onDrop={onDrop}>
      {({ getRootProps, getInputProps, open }) => (
        <Box
          {...getRootProps()}
          width="full"
          fill="horizontal"
          align="center"
          pad={{
            vertical: '32px'
          }}
          border={{
            style: 'dashed'
          }}
        >
          <input {...getInputProps()} />
          <Button label="Select Files" onClick={open} primary />
          <Text color="text-weak" margin="large">
            or drag and drop files
          </Text>
          <Text color="text-weak" weight="bold">
            {fileTypes.length
              ? 'Supported file format:'
              : 'Supported file formats:'}
            {fileTypes.map((ft) => ` ${ft.toUpperCase()}`)}
          </Text>
        </Box>
      )}
    </Dropzone>
  )
}
