import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { TaxContext } from '@/store/TaxContext';
import TaxForm from './TaxForm';

// Mock the icon to avoid SVG rendering issues in tests
jest.mock('@tabler/icons-react', () => ({
  IconCurrencyDollarCanadian: () => <div data-testid="currency-icon" />,
}));

describe('TaxForm', () => {
  const defaultContextValue = {
    year: 2019,
    setYear: jest.fn(),
    setIncome: jest.fn(),
    income: null,
    loading: false,
    brackets: [],
    error: false,
    getRates: jest.fn(),
    results: [],
  };

  const renderTaxForm = (contextValue = defaultContextValue) => {
    return render(
      <MantineProvider>
        {/* @ts-expect-error No need to keep all items on the state */}
        <TaxContext.Provider value={contextValue}>
          <TaxForm />
        </TaxContext.Provider>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Year Selector', () => {
    test('should render with initial year value', () => {
      renderTaxForm();
      const yearSelector = screen.getByTestId('year-selector');
      expect(yearSelector).toHaveValue('2019');
    });

    test('should call setYear when year is changed', async () => {
      const setYear = jest.fn();
      renderTaxForm({ ...defaultContextValue, setYear });

      const yearSelector = screen.getByTestId('year-selector');
      await userEvent.click(yearSelector);

      const option2020 = screen.getByText('2020');
      await userEvent.click(option2020);

      expect(setYear).toHaveBeenCalledWith('2020');
    });

    test('should display all year options', async () => {
      renderTaxForm();

      const yearSelector = screen.getByTestId('year-selector');
      await userEvent.click(yearSelector);

      const options = ['2019', '2020', '2021', '2022'];
      options.forEach((year) => {
        expect(screen.getByText(year)).toBeInTheDocument();
      });
    });
  });

  describe('Income Input', () => {
    test('should render with initial income value', () => {
      renderTaxForm({ ...defaultContextValue, income: 50000 as any });
      const incomeInput = screen.getByTestId('income-input');
      expect(incomeInput).toHaveValue('$50,000.00');
    });

    test('should call setIncome when value changes', async () => {
      const setIncome = jest.fn();
      renderTaxForm({ ...defaultContextValue, setIncome });

      const incomeInput = screen.getByTestId('income-input');
      await userEvent.type(incomeInput, '50000');

      expect(setIncome).toHaveBeenCalledWith('50000');
    });

    test('should format number with comma separators', async () => {
      renderTaxForm();
      const incomeInput = screen.getByTestId('income-input');

      await userEvent.type(incomeInput, '1000000');
      expect(incomeInput).toHaveValue('$1,000,000.00');
    });

    test('should be disabled when loading is true', () => {
      renderTaxForm({ ...defaultContextValue, loading: true });
      const incomeInput = screen.getByTestId('income-input');
      expect(incomeInput).toBeDisabled();
    });

    test('should display currency icon', () => {
      renderTaxForm();
      const icon = screen.getByTestId('currency-icon');
      expect(icon).toBeInTheDocument();
    });

    test('should handle step increase', async () => {
      const setIncome = jest.fn();
      renderTaxForm({ ...defaultContextValue, setIncome, income: 50000 as any });

      const incomeInput = screen.getByTestId('income-input');
      const increaseButton = incomeInput.parentElement?.querySelector(
        '[aria-label="Increase value"]'
      );

      if (increaseButton) {
        await userEvent.click(increaseButton);
        expect(setIncome).toHaveBeenCalledWith('51000');
      }
    });

    test('should handle step decrease', async () => {
      const setIncome = jest.fn();
      renderTaxForm({ ...defaultContextValue, setIncome, income: 50000 as any });

      const incomeInput = screen.getByTestId('income-input');
      const decreaseButton = incomeInput.parentElement?.querySelector(
        '[aria-label="Decrease value"]'
      );

      if (decreaseButton) {
        await userEvent.click(decreaseButton);
        expect(setIncome).toHaveBeenCalledWith('49000');
      }
    });
  });

  describe('Form Interaction', () => {
    test('should handle rapid input changes', async () => {
      const setIncome = jest.fn();
      renderTaxForm({ ...defaultContextValue, setIncome });

      const incomeInput = screen.getByTestId('income-input');
      await userEvent.type(incomeInput, '123456', { delay: 50 });

      expect(setIncome).toHaveBeenCalledTimes(6);
    });

    test('should maintain state between year changes', async () => {
      const setYear = jest.fn();
      const initialIncome = 50000;

      renderTaxForm({
        ...defaultContextValue,
        setYear,
        income: initialIncome as any,
      });

      const yearSelector = screen.getByTestId('year-selector');
      const incomeInput = screen.getByTestId('income-input');

      await userEvent.click(yearSelector);
      const option2020 = screen.getByText('2020');
      await userEvent.click(option2020);

      expect(incomeInput).toHaveValue('$50,000.00');
    });

    test('should handle invalid input gracefully', async () => {
      const setIncome = jest.fn();
      renderTaxForm({ ...defaultContextValue, setIncome });

      const incomeInput = screen.getByTestId('income-input');
      await userEvent.type(incomeInput, 'abc');

      expect(setIncome).not.toHaveBeenCalled();
    });
  });
});
