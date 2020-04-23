import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text
} from 'grommet'
import styled from 'styled-components'

let DetailsTable = ({ data, className }) => {
  const handleArray = (value) => Array.isArray(value) ? value.join(', ') : value

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
              <Text italic={!datum.value}>
                {datum.value ? handleArray(datum.value) : 'Not specified'}
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
