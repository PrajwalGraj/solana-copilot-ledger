export const LEDGER_IMPLEMENTATION_ERROR = "Replace with Ledger Agent Stack implementation";

export const SPECULOS_DEFAULT_BASE_URL = "http://localhost:5000";

export const DEFAULT_LEDGER_DEVICE = {
  id: "ledger-speculos",
  name: "Speculos Emulator",
  type: "speculos",
  connectionMethod: "ledger-wallet-cli",
};

export const LEDGER_TODO_MARKERS = {
  ledger: "// TODO: REAL LEDGER IMPLEMENTATION",
  speculos: "// TODO: SPECULOS IMPLEMENTATION",
} as const;
