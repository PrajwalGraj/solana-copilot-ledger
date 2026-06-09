import {
  DEFAULT_LEDGER_DEVICE,
  LEDGER_IMPLEMENTATION_ERROR,
  SPECULOS_DEFAULT_BASE_URL,
} from "./ledger.constants";
import type {
  LedgerDevice,
  LedgerSignRequest,
  LedgerSignResponse,
  LedgerSigner,
  LedgerStatus,
} from "./ledger.types";

export class LedgerService implements LedgerSigner {
  async connect(): Promise<LedgerDevice> {
    // TODO: REAL LEDGER IMPLEMENTATION
    // TODO: SPECULOS IMPLEMENTATION
    // Integration target: Ledger Agent Stack -> Ledger Wallet CLI -> Speculos/Ledger device.
    // Speculos default base URL should be wired to: http://localhost:5000
    void SPECULOS_DEFAULT_BASE_URL;
    void DEFAULT_LEDGER_DEVICE;
    throw new Error(LEDGER_IMPLEMENTATION_ERROR);
  }

  async disconnect(): Promise<void> {
    // TODO: REAL LEDGER IMPLEMENTATION
    // TODO: SPECULOS IMPLEMENTATION
    throw new Error(LEDGER_IMPLEMENTATION_ERROR);
  }

  isConnected(): boolean {
    // TODO: REAL LEDGER IMPLEMENTATION
    // TODO: SPECULOS IMPLEMENTATION
    throw new Error(LEDGER_IMPLEMENTATION_ERROR);
  }

  async signTransaction(_request: LedgerSignRequest): Promise<LedgerSignResponse> {
    // TODO: REAL LEDGER IMPLEMENTATION
    // TODO: SPECULOS IMPLEMENTATION
    throw new Error(LEDGER_IMPLEMENTATION_ERROR);
  }

  async getDeviceInfo(): Promise<LedgerDevice | null> {
    // TODO: REAL LEDGER IMPLEMENTATION
    // TODO: SPECULOS IMPLEMENTATION
    throw new Error(LEDGER_IMPLEMENTATION_ERROR);
  }

  async getStatus(): Promise<LedgerStatus> {
    // TODO: REAL LEDGER IMPLEMENTATION
    // TODO: SPECULOS IMPLEMENTATION
    throw new Error(LEDGER_IMPLEMENTATION_ERROR);
  }
}

export const ledgerService = new LedgerService();
