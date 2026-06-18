export const Format = {
  XLSX: "xlsx",
  XLS: "xls",
  CSV: "csv",
} as const;

export type Format = typeof Format[keyof typeof Format];
