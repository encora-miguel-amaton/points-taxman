import { API } from '@/services/api';

export const fetchRates = async (year: Year): Promise<Bracket[]> => {
  const response = await API.get<RateResponse>(`tax-calculator/tax-year/${year}`);

  return response.data.tax_brackets;
};
