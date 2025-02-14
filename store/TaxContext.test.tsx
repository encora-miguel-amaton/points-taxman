import React from 'react';
import { act, render } from '@testing-library/react';
import { fetchRates } from '@/services/tax';
import { calculateTaxes } from '@/utilities/calculate';
import { SET_ERROR, SET_INCOME, SET_LOADING, SET_RATES, SET_YEAR } from '../constants';
import { reducer, TaxContext, TaxProvider } from './TaxContext';

// Mock dependencies
jest.mock('@/services/tax');
jest.mock('@/utilities/calculate');

describe('Tax Context', () => {
  // Setup mock implementations
  const mockFetchRates = fetchRates as jest.Mock;
  const mockCalculateTaxes = calculateTaxes as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Reducer', () => {
    const initialState = {
      brackets: [],
      year: 2019 as Year,
      income: null,
      error: false,
      loading: true,
    };

    test('should use a default initial state if none is passed', () => {
      const loading = false;

      const action = { type: SET_LOADING, payload: loading };
      const newState = reducer(undefined, action as any);

      expect(newState.loading).toEqual(loading);
      expect(newState).not.toBe(initialState); // Ensure new reference
    });

    test('should handle SET_RATES', () => {
      const mockBrackets = [
        { min: 0, max: 50000, rate: 0.15 },
        { min: 50001, max: undefined as unknown as number, rate: 0.25 },
      ];

      const action = { type: SET_RATES, payload: mockBrackets };
      const newState = reducer(initialState, action as any);

      expect(newState.brackets).toEqual(mockBrackets);
      expect(newState).not.toBe(initialState); // Ensure new reference
    });

    test('should handle SET_YEAR', () => {
      const action = { type: SET_YEAR, payload: 2022 };
      const newState = reducer(initialState, action as any);

      expect(newState.year).toBe(2022);
    });

    test('should handle SET_INCOME', () => {
      const action = { type: SET_INCOME, payload: 75000 };
      const newState = reducer(initialState, action as any);

      expect(newState.income).toBe(75000);
    });

    test('should handle SET_ERROR', () => {
      const action = { type: SET_ERROR, payload: true };
      const newState = reducer(initialState, action as any);

      expect(newState.error).toBe(true);
    });

    test('should handle SET_LOADING', () => {
      const action = { type: SET_LOADING, payload: false };
      const newState = reducer(initialState, action as any);

      expect(newState.loading).toBe(false);
    });

    test('should return current state for unknown action', () => {
      const action = { type: 'UNKNOWN' as any, payload: null };
      const newState = reducer(initialState, action as any);

      expect(newState).toBe(initialState);
    });
  });

  describe('TaxProvider', () => {
    const customRender = (ui: React.ReactElement) => {
      return render(ui);
    };

    test('should fetch rates on mount', async () => {
      const mockBrackets = [{ min: 0, max: 50000, rate: 0.15 }];
      mockFetchRates.mockResolvedValueOnce(mockBrackets);

      await act(async () => {
        customRender(
          <TaxProvider>
            <TaxContext.Consumer>
              {(value) => <div data-testid="year">{value.year}</div>}
            </TaxContext.Consumer>
          </TaxProvider>
        );
      });

      expect(mockFetchRates).toHaveBeenCalledWith(2019);
    });

    test('should handle error in fetching rates', async () => {
      mockFetchRates.mockRejectedValueOnce(new Error('API Error'));

      await act(async () => {
        customRender(
          <TaxProvider>
            <TaxContext.Consumer>
              {(value) => <div data-testid="error">{String(value.error)}</div>}
            </TaxContext.Consumer>
          </TaxProvider>
        );
      });

      expect(mockFetchRates).toHaveBeenCalled();
    });

    test('should calculate results when income changes', async () => {
      const mockBrackets = [{ min: 0, max: 50000, rate: 0.15 }];
      const mockResults = [{ bracket: mockBrackets[0], tax: 7500 }];

      mockFetchRates.mockResolvedValueOnce(mockBrackets);
      mockCalculateTaxes.mockReturnValue(mockResults);

      let contextValue: any;

      await act(async () => {
        customRender(
          <TaxProvider>
            <TaxContext.Consumer>
              {(value) => {
                contextValue = value;
                return null;
              }}
            </TaxContext.Consumer>
          </TaxProvider>
        );
      });

      await act(async () => {
        contextValue.setIncome('50000');
      });

      expect(mockCalculateTaxes).toHaveBeenCalledWith(50000, mockBrackets);
    });
  });

  describe('Context Methods', () => {
    let contextValue: any;

    beforeEach(async () => {
      await act(async () => {
        render(
          <TaxProvider>
            <TaxContext.Consumer>
              {(value) => {
                contextValue = value;
                return null;
              }}
            </TaxContext.Consumer>
          </TaxProvider>
        );
      });
    });

    test('setYear should parse and dispatch year correctly', async () => {
      await act(async () => {
        contextValue.setYear('2022');
      });

      expect(mockFetchRates).toHaveBeenCalledWith(2022);
    });

    test('setIncome should handle valid income string', async () => {
      await act(async () => {
        contextValue.setIncome('75000.50');
      });

      expect(contextValue.income).toBe(75000.5);
    });

    test('setIncome should handle invalid inputs', async () => {
      const originalIncome = contextValue.income;

      await act(async () => {
        contextValue.setIncome('invalid');
      });

      expect(contextValue.income).toBe(originalIncome);
    });

    test('setIncome should handle null input', async () => {
      const originalIncome = contextValue.income;

      await act(async () => {
        contextValue.setIncome(null);
      });

      expect(contextValue.income).toBe(originalIncome);
    });
  });

  describe('Effects and Memoization', () => {
    test('should recalculate results when brackets change', async () => {
      const initialBrackets = [{ min: 0, max: 50000, rate: 0.15 }];
      const newBrackets = [{ min: 0, max: 75000, rate: 0.2 }];

      mockFetchRates.mockResolvedValueOnce(initialBrackets);
      mockCalculateTaxes.mockReturnValue([]);

      let contextValue: any;

      await act(async () => {
        render(
          <TaxProvider>
            <TaxContext.Consumer>
              {(value) => {
                contextValue = value;
                return null;
              }}
            </TaxContext.Consumer>
          </TaxProvider>
        );
      });

      // Set income and verify initial calculation
      await act(async () => {
        contextValue.setIncome('50000');
      });

      expect(mockCalculateTaxes).toHaveBeenCalledWith(50000, initialBrackets);

      // Change brackets and verify recalculation
      mockFetchRates.mockResolvedValueOnce(newBrackets);

      await act(async () => {
        contextValue.getRates(2022);
      });

      expect(mockCalculateTaxes).toHaveBeenCalledWith(50000, newBrackets);
    });
  });
});
