type Bracket = {
  min: number;
  max: number;
  rate: number;
};

type Result = {
  taxable: number;
  taxed: number;
};

export const calculateTaxes = (value: number, brackets: Bracket[]): Result[] => {
  let i = 0;
  let income = value;
  const result: Result[] = [];

  if (brackets.length === 0 || !brackets[0] || typeof brackets[0].min !== 'number') {
    return [];
  }

  while (income > 0 && i < brackets.length) {
    const currentTaxRate = brackets[i];
    const amountAvailableInThisBracket = Math.min(
      income,
      (currentTaxRate.max || value) - currentTaxRate.min
    );

    const taxable = amountAvailableInThisBracket;
    const taxed = taxable * currentTaxRate.rate;

    result.push({ taxable, taxed });

    income -= taxable;
    i++;
  }

  return result;
};
