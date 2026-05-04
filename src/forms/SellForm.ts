import { InputMode } from "../enums/InputMode";

export interface SellForm {
  date: string;
  company: string;
  inputMode: InputMode;
  amount: string;
  currencyId: string;
  shares: string;
  capitalGain: string;
  gainCurrencyId: string;
}

export const emptySell = (): SellForm => ({
  date: "",
  company: "",
  inputMode: InputMode.AMOUNT,
  amount: "",
  currencyId: "",
  shares: "",
  capitalGain: "",
  gainCurrencyId: "",
});
