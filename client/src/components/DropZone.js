import React from 'react';
import { Box, Text, Button, ResponsiveContext } from 'grommet';
import Dropzone from 'react-dropzone'

export default ({
  fileTypes = [],
  multiple = true,
  onDrop,
}) => {
  const size = React.useContext(ResponsiveContext)
  return (
    <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
      {({getRootProps, getInputProps, open}) => (
        <Box
          width="full"
          fill="horizontal"
          align="center"
          pad={{
            vertical: "32px"
          }}
          border={{
            style: 'dashed'
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
            <Button
              label="Select Files"
              onClick={open}
              primary
            />
            <Text
              color="text-weak"
              margin={{
                vertical: "medium"
              }}
            >
            or  drag and drop files
          </Text>
          <Text
            color="text-weak"
            weight="bold"
          >
            {
              fileTypes.length
                ? "Supported file format:"
                : "Supported file formats:"
            }
            {fileTypes.map(ff => ff)}
          </Text>
        </Box>
      )}
    </Dropzone>
  );
}
