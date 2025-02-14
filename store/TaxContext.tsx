'use client';

import React, { createContext, useEffect, useMemo, useReducer } from 'react';
import { SET_ERROR, SET_INCOME, SET_LOADING, SET_RATES, SET_YEAR } from '@/constants';
import { fetchRates } from '@/services/tax';
import { calculateTaxes } from '@/utilities/calculate';

type TaxAction =
  | { type: typeof SET_RATES; payload: Bracket[] }
  | { type: typeof SET_YEAR; payload: Year }
  | { type: typeof SET_INCOME; payload: number }
  | { type: typeof SET_ERROR; payload: boolean }
  | { type: typeof SET_LOADING; payload: boolean };

type TaxState = {
  brackets: Bracket[];
  year: Year;
  income: number | null;
  error: boolean;
  loading: boolean;
};

interface Provider extends TaxState {
  getRates: (year: Year) => void;
  setYear: (year: string) => void;
  setIncome: (income: string | null) => void;
  results: Result[];
}

const initialState: TaxState = {
  brackets: [],
  year: 2019,
  income: null,
  error: false,
  loading: true,
};

export const TaxContext = createContext<Provider>({} as Provider);

export const reducer = (state: TaxState = initialState, action: TaxAction): TaxState => {
  switch (action.type) {
    case SET_RATES:
      return { ...state, brackets: action.payload };

    case SET_YEAR:
      return { ...state, year: action.payload };

    case SET_INCOME:
      return { ...state, income: action.payload };

    case SET_ERROR:
      return { ...state, error: action.payload };

    case SET_LOADING:
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};

export const TaxProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const results = useMemo(() => {
    if (state.income) {
      return calculateTaxes(state.income, state.brackets);
    }

    return [];
  }, [state.income, state.brackets]);

  const getRates = async (year: Year) => {
    dispatch({ type: SET_LOADING, payload: true });

    try {
      const brackets = await fetchRates(year);

      dispatch({ type: SET_RATES, payload: brackets });
    } catch (error) {
      dispatch({ type: SET_ERROR, payload: true });
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  const setYear = (input: string) => {
    const year = Number.parseInt(input, 10) as Year;

    dispatch({ type: SET_YEAR, payload: year });
  };

  const setIncome = (income: string | null) => {
    let value = 0;

    if (!income || Number.isNaN(Number.parseFloat(income))) {
      return;
    }

    value = Number.parseFloat(income);
    dispatch({ type: SET_INCOME, payload: value });
  };

  useEffect(() => {
    getRates(state.year);
  }, [state.year]);

  return (
    <TaxContext.Provider value={{ ...state, getRates, setYear, setIncome, results }}>
      {children}
    </TaxContext.Provider>
  );
};
