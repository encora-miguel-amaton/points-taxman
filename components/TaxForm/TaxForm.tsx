import React, { useContext } from 'react';
import { IconCurrencyDollarCanadian } from '@tabler/icons-react';
import { Loader, NumberInput, Select } from '@mantine/core';
import { TaxContext } from '@/store/TaxContext';

const TaxForm: React.FC = (): React.ReactNode => {
  const { year, setYear, setIncome, income, loading } = useContext(TaxContext);
  const onYearChanged = (value: string | null) => {
    if (value) {
      setYear(value);
    }
  };

  const onIncomeChanged = (value: string | number) => {
    setIncome(`${value}`);
  };

  return (
    <>
      <Select
        data-testid="year-selector"
        label="Year to calculate"
        placeholder="Pick a year from 2019 to 2022"
        onChange={onYearChanged}
        rightSection={loading && <Loader size="sm" />}
        value={`${year}`}
        data={['2019', '2020', '2021', '2022']}
      />
      <NumberInput
        data-testid="income-input"
        label="Income during the year"
        placeholder="Dollars"
        prefix="$"
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator=","
        leftSection={<IconCurrencyDollarCanadian size={20} stroke={1.5} />}
        step={1000}
        stepHoldDelay={500}
        stepHoldInterval={100}
        value={income || undefined}
        onChange={onIncomeChanged}
        disabled={loading}
      />
    </>
  );
};

export default TaxForm;
