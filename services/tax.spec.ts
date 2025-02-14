import { API } from '@/services/api';
import { fetchRates } from '@/services/tax';

jest.mock('@/services/api');

describe('Tax Rates API', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchRates', () => {
    const mockYear = 2020;
    const mockTaxBrackets: Bracket[] = [
      { min: 0, max: 50000, rate: 0.15 },
      { min: 50001, max: 100000, rate: 0.25 },
      { min: 100001, max: undefined as unknown as number, rate: 0.35 },
    ];

    test('should successfully fetch tax rates for a given year', async () => {
      const mockResponse = {
        data: {
          tax_brackets: mockTaxBrackets,
        },
        status: 200,
      };

      (API.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await fetchRates(mockYear);

      expect(API.get).toHaveBeenCalledTimes(1);
      expect(API.get).toHaveBeenCalledWith(`tax-calculator/tax-year/${mockYear}`);
      expect(result).toEqual(mockTaxBrackets);
      expect(result.length).toBe(3);
    });

    test('should handle empty tax brackets array', async () => {
      const mockResponse = {
        data: {
          tax_brackets: [],
        },
        status: 200,
      };

      (API.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await fetchRates(mockYear);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    test('should throw error when API call fails', async () => {
      const mockError = new Error('API Error');
      (API.get as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(fetchRates(mockYear)).rejects.toThrow('API Error');
    });

    test('should validate tax bracket ordering', async () => {
      const mockResponse = {
        data: {
          tax_brackets: mockTaxBrackets,
        },
        status: 200,
      };

      (API.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await fetchRates(mockYear);

      // Verify brackets are in ascending order
      for (let i = 1; i < result.length; i++) {
        expect(result[i].min).toBeGreaterThan(result[i - 1].min);
        if (result[i - 1].max !== null) {
          expect(result[i].min).toBeGreaterThan(result[i - 1].max!);
        }
      }
    });

    test('should handle network timeouts', async () => {
      (API.get as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      await expect(fetchRates(mockYear)).rejects.toThrow('Network timeout');
    });
  });
});
