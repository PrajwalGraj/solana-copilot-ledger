export type LedgerConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "awaiting_approval"
  | "signing"
  | "error";

export interface LedgerDevice {
  id: string;
  name: string;
  type: "speculos" | "ledger_hardware" | "unknown";
  connectionMethod: "ledger-wallet-cli" | "usb" | "unknown";
}

export interface LedgerTransactionSummary {
  title: string;
  description: string;
  amount: string;
  recipient: string;
  network: string;
  estimatedFee: string;
  details?: { label: string; value: string }[];
}

export interface LedgerSignRequest {
  requestId: string;
  transaction: unknown;
  summary: LedgerTransactionSummary;
  createdAt: string;
}

export interface LedgerSignResponse {
  requestId: string;
  signature: string;
  signedTransaction: unknown;
}

export interface LedgerStatus {
  connected: boolean;
  connecting: boolean;
  awaitingApproval: boolean;
  signing: boolean;
  success: boolean;
  error: string | null;
  device: LedgerDevice | null;
  lastSignature: string | null;
  connectionState: LedgerConnectionState;
}

export interface LedgerSigner {
  connect(): Promise<LedgerDevice>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  signTransaction(request: LedgerSignRequest): Promise<LedgerSignResponse>;
  getDeviceInfo(): Promise<LedgerDevice | null>;
  getStatus(): Promise<LedgerStatus>;
}
