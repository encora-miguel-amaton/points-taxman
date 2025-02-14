import { calculateTaxes } from '../utilities/calculate';

describe('calculateTaxes', () => {
  describe('No brackets provided', () => {
    it('should return empty array when no brackets are given', () => {
      expect(calculateTaxes(1000, [])).toEqual([]);
    });
  });

  describe('Zero value', () => {
    it('should return empty array for zero value', () => {
      expect(calculateTaxes(0, [{ min: 1, max: 10, rate: 0.1 }])).toEqual([]);
    });
  });

  describe('Negative value', () => {
    it('should return empty array for negative values', () => {
      expect(calculateTaxes(-500, [{ min: 50, max: 200, rate: 0.2 }])).toEqual([]);
    });
  });

  describe('Null or undefined values', () => {
    it('should handle null or undefined values gracefully', () => {
      const result = calculateTaxes(null as unknown as number, [{ min: 50, max: 200, rate: 0.2 }]);
      expect(result).toEqual([]);
    });
  });

  describe('Bracket with undefined max', () => {
    it('should handle brackets without max defined', () => {
      const result = calculateTaxes(100, [
        { min: 50, max: undefined as unknown as number, rate: 0.2 },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].taxable).toBe(50);
      expect(result[0].taxed).toBe(10);
    });
  });

  describe('Invalid bracket type', () => {
    it('should handle invalid bracket types gracefully', () => {
      const result = calculateTaxes(100, [
        { min: 'string' as unknown as number, max: 200, rate: 0.2 },
      ]);
      expect(result).toEqual([]);
    });
  });
});
