type Year = 2019 | 2020 | 2021 | 2022;

type Bracket = {
  min: number;
  max: number;
  rate: number;
};

type RateResponse = {
  tax_brackets: Bracket[];
};

type Result = {
  taxable: number;
  taxed: number;
};
