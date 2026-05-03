export interface DividendForm {
  date: string;
  amount: string;
  currencyId: string;
}

export const emptyDividend = (): DividendForm => ({
  date: "",
  amount: "",
  currencyId: "",
});
