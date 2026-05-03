import type { SortState } from "../models/items/SortState";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import { SortDir } from "../enums/SortDir";

export function toggleSort(current: SortState | null, key: string): SortState | null {
  if (current?.key !== key) {
    return { key, dir: SortDir.ASC };
  }
  if (current.dir === SortDir.ASC) {
    return { key, dir: SortDir.DESC };
  }
  
  return null;
}

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined, dir: SortState["dir"]): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }

  const result = a < b ? -1 : a > b ? 1 : 0;
  return dir === SortDir.ASC ? result : -result;
}

export function sortBuys(rows: AssetBuyResponse[], sort: SortState | null): AssetBuyResponse[] {
  if (!sort) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "date": {
        return compareValues(a.buyDate, b.buyDate, sort.dir);
      }
      case "company": {
        return compareValues(a.companyName ?? "", b.companyName ?? "", sort.dir);
      }
      case "amount": {
        return compareValues(a.assetBuyAmount ?? a.assetBuyShare, b.assetBuyAmount ?? b.assetBuyShare, sort.dir);
      }
      case "pricePerShare": {
        return compareValues(a.assetBuyPricePerShare, b.assetBuyPricePerShare, sort.dir);
      }
      default: {
        return 0;
      }
    }
  });
}

export function sortSells(rows: AssetSellResponse[], sort: SortState | null): AssetSellResponse[] {
  if (!sort) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "date": {
        return compareValues(a.sellDate, b.sellDate, sort.dir);
      }
      case "company": {
        return compareValues(a.companyName ?? "", b.companyName ?? "", sort.dir);
      }
      case "amount": {
        return compareValues(a.assetSellAmount ?? a.assetSellShare, b.assetSellAmount ?? b.assetSellShare, sort.dir);
      }
      case "gain": {
        return compareValues(a.assetSellGain, b.assetSellGain, sort.dir);
      }
      default: {
        return 0;
      }
    }
  });
}

export function sortDividends(rows: AssetDividendResponse[], sort: SortState | null, currencyName: (id: string) => string): AssetDividendResponse[] {
  if (!sort) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    switch (sort.key) {
      case "date": {
        return compareValues(a.cashflowDate, b.cashflowDate, sort.dir);
      }
      case "amount": {
        return compareValues(a.cashflowAmount, b.cashflowAmount, sort.dir);
      }
      case "currency": {
        return compareValues(currencyName(a.currencyId), currencyName(b.currencyId), sort.dir);
      }
      default: {
        return 0;
      }
    }
  });
}
