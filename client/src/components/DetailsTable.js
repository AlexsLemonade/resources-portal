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

function DetailsTable({ data, className }) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableCell scope="col" align="right" />
          <TableCell scope="col" align="right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((datum, i) => (
          <TableRow key={datum['label']}>
            <TableCell
              align="center"
              pad="medium"
              align="right"
              verticalAlign="top"
            >
              <Text weight="bold">{datum['label']}</Text>
            </TableCell>
            <TableCell align="center" pad="medium" align="left">
              <Text>{datum['value']}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
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
    background-color: ${props =>
      props.theme.global.colors['background-highlight']};
  }
`;

export default DetailsTable;
