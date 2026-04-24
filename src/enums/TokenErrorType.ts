export const TokenErrorType = {
  MISSING: "MISSING",
  EXPIRED: "EXPIRED",
  INVALID: "INVALID",
  UNKNOWN: "UNKNOWN",
} as const;

export type TokenErrorType = typeof TokenErrorType[keyof typeof TokenErrorType];
