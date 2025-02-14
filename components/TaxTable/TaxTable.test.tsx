import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { TaxContext } from '@/store/TaxContext';
import { formatBracket, formatCurrency } from '@/utilities/format';
import TaxTable from './TaxTable';

jest.mock('@/utilities/format', () => ({
  formatBracket: jest.fn((bracket) => `$${bracket.min} - ${bracket.max || '∞'}`),
  formatCurrency: jest.fn((amount) => `$${amount.toFixed(2)}`),
}));

describe('TaxTable', () => {
  const mockBrackets = [
    { min: 0, max: 50000, rate: 0.15 },
    { min: 50001, max: 100000, rate: 0.25 },
    { min: 100001, max: null, rate: 0.35 },
  ];

  const mockResults = [
    { taxable: 50000, taxed: 7500 },
    { taxable: 50000, taxed: 12500 },
    { taxable: 25000, taxed: 8750 },
  ];

  const defaultContextValue = {
    brackets: mockBrackets,
    results: mockResults,
    year: 2024,
    income: 125000,
    error: false,
    loading: false,
    getRates: jest.fn(),
    setYear: jest.fn(),
    setIncome: jest.fn(),
  };

  const renderTaxTable = (contextValue = defaultContextValue) => {
    return render(
      <MantineProvider>
        {/* @ts-expect-error No need to keep all items on the state */}
        <TaxContext.Provider value={contextValue}>
          <TaxTable />
        </TaxContext.Provider>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Table Structure', () => {
    test('should render table headers correctly', () => {
      renderTaxTable();

      expect(screen.getByText('Tax bracket')).toBeInTheDocument();
      expect(screen.getByText('Marginal tax rate')).toBeInTheDocument();
      expect(screen.getByText('Amount taxable')).toBeInTheDocument();
      expect(screen.getByText('Tax payable')).toBeInTheDocument();
    });

    test('should render with correct number of rows', () => {
      renderTaxTable();

      // Number of data rows + header row + total row
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockResults.length + 2);
    });

    test('should render empty table when no results', () => {
      renderTaxTable({
        ...defaultContextValue,
        results: [],
        brackets: [],
      });

      const rows = screen.getAllByRole('row');
      // Should only have header row and total row
      expect(rows).toHaveLength(2);
    });
  });

  describe('Data Display', () => {
    test('should format tax brackets correctly', () => {
      renderTaxTable();

      mockBrackets.forEach((bracket) => {
        expect(formatBracket).toHaveBeenCalledWith(bracket);
      });
    });

    test('should display correct tax rates', () => {
      renderTaxTable();

      mockBrackets.forEach((bracket) => {
        const rate = `${(bracket.rate * 100).toFixed(2)}%`;
        expect(screen.getByText(rate)).toBeInTheDocument();
      });
    });

    test('should format currency values correctly', () => {
      renderTaxTable();

      mockResults.forEach((result) => {
        expect(formatCurrency).toHaveBeenCalledWith(result.taxable);
        expect(formatCurrency).toHaveBeenCalledWith(result.taxed);
      });
    });

    test('should calculate and display totals correctly', () => {
      renderTaxTable();

      const totalTaxable = mockResults.reduce((sum, c) => sum + c.taxable, 0);
      const totalTaxed = mockResults.reduce((sum, c) => sum + c.taxed, 0);

      expect(formatCurrency).toHaveBeenCalledWith(totalTaxable);
      expect(formatCurrency).toHaveBeenCalledWith(totalTaxed);
    });
  });

  describe('Edge Cases', () => {
    test('should handle mismatched brackets and results lengths', () => {
      const mismatchedContext = {
        ...defaultContextValue,
        results: mockResults.slice(0, 2), // Fewer results than brackets
      };

      renderTaxTable(mismatchedContext);

      const rows = screen.getAllByRole('row');
      // Header + 2 data rows + total row
      expect(rows).toHaveLength(4);
    });

    test('should handle zero values correctly', () => {
      const zeroValuesContext = {
        ...defaultContextValue,
        results: [
          { taxable: 0, taxed: 0 },
          { taxable: 0, taxed: 0 },
        ],
      };

      renderTaxTable(zeroValuesContext);

      expect(formatCurrency).toHaveBeenCalledWith(0);
    });

    test('should handle large numbers without scientific notation', () => {
      const largeValuesContext = {
        ...defaultContextValue,
        results: [
          { taxable: 1000000, taxed: 150000 },
          { taxable: 2000000, taxed: 500000 },
        ],
      };

      renderTaxTable(largeValuesContext);

      expect(formatCurrency).toHaveBeenCalledWith(1000000);
      expect(formatCurrency).toHaveBeenCalledWith(2000000);
    });
  });

  describe('Visual Formatting', () => {
    test('should align total row correctly', () => {
      renderTaxTable();

      const totalRow = screen.getAllByRole('row').pop();
      expect(totalRow).toBeTruthy();

      if (totalRow) {
        const cells = totalRow.querySelectorAll('td, th');
        expect(cells[0]).toBeEmptyDOMElement();
        expect(cells[1]).toHaveTextContent('Total');
      }
    });
  });
});
