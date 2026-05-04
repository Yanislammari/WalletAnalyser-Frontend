import { InputMode } from "../enums/InputMode";

export interface BuyForm {
  date: string;
  company: string;
  inputMode: InputMode;
  amount: string;
  currencyId: string;
  shares: string;
  pricePerShare: string;
}

export const emptyBuy = (): BuyForm => ({
  date: "",
  company: "",
  inputMode: InputMode.AMOUNT,
  amount: "",
  currencyId: "",
  shares: "",
  pricePerShare: "",
});
