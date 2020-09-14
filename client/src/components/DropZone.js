import React from 'react'
import { Box, Text, Button } from 'grommet'
import Dropzone from 'react-dropzone'

// We are restricted to 1GB attachments
export default ({ fileTypes = [], multiple = true, onDrop }) => {
  return (
    <Dropzone
      multiple={multiple}
      accept={fileTypes.map((ft) => `.${ft}`)}
      onDrop={onDrop}
      maxSize={1000000000}
    >
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
            size: 'small',
            style: 'dashed'
          }}
        >
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <input {...getInputProps()} />
          <Button label="Select Files" onClick={open} primary />
          <Text color="text-weak" margin={{ top: 'small', bottom: 'medium' }}>
            or drag and drop files
          </Text>
          <Text color="text-weak" margin={{ top: 'small', bottom: 'medium' }}>
            Max Size Per File: 1GB
          </Text>
          <Text color="text-weak" weight="bold">
            {fileTypes.length && fileTypes.length === 1
              ? 'Supported file format:'
              : 'Supported file formats:'}
            {fileTypes.map(
              (ft, i) => `${i > 0 ? ',' : ''} ${ft.toUpperCase()}`
            )}
          </Text>
        </Box>
      )}
    </Dropzone>
  )
}
