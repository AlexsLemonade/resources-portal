import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text
} from 'grommet';
import styled from 'styled-components';

function DetailsTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell scope="col" align="right" />
          <TableCell scope="col" align="right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((datum, i) => (
          <TableRow key={datum['name']}>
            <TableCell align="center">
              <Text>{datum['name']}</Text>
            </TableCell>
            <TableCell align="center">
              <Text>{datum['value']}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DetailsTable;
