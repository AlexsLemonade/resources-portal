import React from 'react'
import { Box, Text, Button } from 'grommet'
import Dropzone from 'react-dropzone'

export default ({ fileTypes = [], onDrop }) => {
  return (
    <Dropzone accept={fileTypes.map((ft) => `.${ft}`)} onDrop={onDrop}>
      {({ getRootProps, getInputProps, open }) => (
        <Box
          {...getRootProps()} // eslint-disable-line react/jsx-props-no-spreading
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
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <input {...getInputProps()} />{' '}
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
