import React from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text,
  Image
} from 'grommet'
import styled from 'styled-components'
import { host } from 'api'

let DetailsTable = ({ data, className }) => {
  const datumValue = (value) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not Specified'
      if (Object.keys(value[0]).includes('filename')) {
        return (
          <Box>
            {value.map((attachment) => (
              <Box key={attachment.filename} width="100px" height="120px">
                <Image fit="cover" src={`${host}${attachment.download_url}`} />
                <Text truncate>{attachment.filename}</Text>
              </Box>
            ))}
          </Box>
        )
      }
      return value.join(', ')
    }
    return value
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableCell scope="col" align="right" />
          <TableCell scope="col" align="right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((datum) => (
          <TableRow key={datum.label}>
            <TableCell pad="medium" align="right" verticalAlign="top">
              <Text weight="bold">{datum.label}</Text>
            </TableCell>
            <TableCell pad="medium" align="left">
              <Text italic={!datum.value || datum.value.length === 0}>
                {datum.value ? datumValue(datum.value) : 'Not specified'}
              </Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

DetailsTable = styled(DetailsTable)`
  width: 100%;

  thead {
    display: none;
  }

  tbody > tr > td:first-child {
    width: 150px;
  }

  tbody > tr:nth-child(2n + 1) {
    background-color: ${(props) =>
      props.theme.global.colors['background-highlight']};
  }
`

export default DetailsTable
