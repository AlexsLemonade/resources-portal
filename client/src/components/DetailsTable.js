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
import PreviewMap from 'components/PreviewSequenceMap'
import { getBooleanString } from 'helpers/booleanOptions'

const DetailsTableDetail = ({ datum, emptyString = 'Not Specified' }) => {
  const { value } = datum

  // true false or null should be treated as booleans
  const bool = getBooleanString(value)
  if (bool !== undefined) return <Text italic={value === null}>{bool}</Text>

  // check if unset, empty string, or empty array
  const isEmpty = !value || value.length === 0
  if (isEmpty) return <Text italic>{emptyString}</Text>

  // check if it is an array of values
  const isArray = Array.isArray(value)
  const isFiles = isArray && Object.keys(value[0]).includes('filename')
  if (isArray)
    return (
      <Text>
        {isFiles
          ? value.map((map) => <PreviewMap key={map.filename} map={map} />)
          : value.join(', ')}
      </Text>
    )

  return <Text>{value}</Text>
}

let DetailsTable = ({ data, className }) => {
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
              <DetailsTableDetail datum={datum} />
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
