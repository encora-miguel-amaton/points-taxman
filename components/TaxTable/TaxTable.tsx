import React, { useContext } from 'react';
import { Table } from '@mantine/core';
import { TaxContext } from '@/store/TaxContext';
import { formatBracket, formatCurrency } from '@/utilities/format';

const TaxTable: React.FC = (): React.ReactNode => {
  const { results, brackets } = useContext(TaxContext);

  const rows = results.map((result, index) => {
    const bracket = brackets[index];

    return (
      <Table.Tr key={bracket.rate}>
        <Table.Td>{formatBracket(bracket)}</Table.Td>
        <Table.Td>{(bracket.rate * 100).toFixed(2)}%</Table.Td>
        <Table.Td>{formatCurrency(result.taxable)}</Table.Td>
        <Table.Td>{formatCurrency(result.taxed)}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table withColumnBorders withRowBorders withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Tax bracket</Table.Th>
          <Table.Th>Marginal tax rate</Table.Th>
          <Table.Th>Amount taxable</Table.Th>
          <Table.Th>Tax payable</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows}
        <Table.Tr>
          <Table.Td />
          <Table.Th>Total</Table.Th>
          <Table.Th>{formatCurrency(results.reduce((sum, c) => sum + c.taxable, 0))}</Table.Th>
          <Table.Td>{formatCurrency(results.reduce((sum, c) => sum + c.taxed, 0))}</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
};

export default TaxTable;
