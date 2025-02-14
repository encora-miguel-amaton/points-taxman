import { formatBracket, formatCurrency } from '@/utilities/format';

describe('formatCurrency', () => {
  describe('Valid amounts', () => {
    it('should format a number into currency with two decimal places', () => {
      expect(formatCurrency(123.45)).toBe('C$ 123.45');
    });
  });

  describe('Invalid amounts', () => {
    it('should return null for NaN', () => {
      expect(formatCurrency(NaN)).toBeNull();
    });
    it('should return null for Infinity', () => {
      expect(formatCurrency(Infinity)).toBeNull();
    });
  });
});

describe('formatBracket', () => {
  describe('Basic cases', () => {
    it('should return empty string when passed null', () => {
      expect(formatBracket(null as unknown as Bracket)).toBe('');
    });

    it('should format without max property', () => {
      const bracket = { min: 100.23 };
      expect(formatBracket(bracket as unknown as Bracket)).toBe('C$ 100.23+');
    });
  });

  describe('Multiple values', () => {
    it('should include both min and max when present', () => {
      const bracket = { min: 123.45, max: 234.56 };
      expect(formatBracket(bracket as unknown as Bracket)).toBe('C$ 123.45 - C$ 234.56');
    });
  });

  describe('Edge cases', () => {
    it('should handle min greater than max', () => {
      const bracket = { min: 200.23, max: 100.45 };
      expect(formatBracket(bracket as unknown as Bracket)).toBe('C$ 200.23 - C$ 100.45');
    });
  });

  describe('Special numbers', () => {
    it('should handle negative values', () => {
      const bracket = { min: -123.45, max: -99.99 };
      expect(formatBracket(bracket as unknown as Bracket)).toBe('C$ -123.45 - C$ -99.99');
    });
  });

  describe('Invalid amounts', () => {
    it('should return null when min is invalid', () => {
      const bracket = { min: NaN };
      expect(formatBracket(bracket as unknown as Bracket)).toBeNull();
    });
  });
});
