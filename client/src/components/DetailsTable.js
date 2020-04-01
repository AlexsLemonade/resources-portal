import React from 'react';
import { DataTable } from 'grommet';
import styled from 'styled-components';

export default function({ data }) {
  return (
    <DataTable
      columns={[
        {
          property: 'name',
          primary: true,

        },
        {
          property: 'value'
        }
      ]}
      data={data}
    ></DataTable>
  );
}
