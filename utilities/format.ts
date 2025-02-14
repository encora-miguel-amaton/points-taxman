export const formatCurrency = (amount: number): string | null => {
  if (!Number.isFinite(amount)) {
    return null;
  }

  const options = {
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
    locale: 'en-CA',
  };

  const separated = new Intl.NumberFormat('en-CA', options).format(amount);
  return `C$ ${separated}`;
};

export const formatBracket = (bracket: Bracket): string | null => {
  if (!bracket) {
    return '';
  }

  if (!bracket.min || Number.isNaN(bracket.min)) {
    return null;
  }

  if (!bracket.max) {
    return `${formatCurrency(bracket.min)}+`;
  }

  return `${formatCurrency(bracket.min)} - ${formatCurrency(bracket.max)}`;
};
