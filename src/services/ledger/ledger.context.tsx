import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LEDGER_DEVICE } from "./ledger.constants";
import { ledgerService } from "./ledger.service";
import type {
  LedgerDevice,
  LedgerSignRequest,
  LedgerSignResponse,
  LedgerStatus,
  LedgerTransactionSummary,
} from "./ledger.types";

interface LedgerContextValue extends LedgerStatus {
  currentSummary: LedgerTransactionSummary | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  startApproval: (summary: LedgerTransactionSummary) => void;
  clearApproval: () => void;
  signTransaction: (request: LedgerSignRequest) => Promise<LedgerSignResponse>;
  setSuccessState: (signature: string | null) => void;
  setErrorState: (message: string | null) => void;
  resetTransientState: () => void;
}

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [signing, setSigning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<LedgerDevice | null>(DEFAULT_LEDGER_DEVICE);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<LedgerTransactionSummary | null>(null);

  const connectionState: LedgerStatus["connectionState"] = connecting
    ? "connecting"
    : error
      ? "error"
      : signing
        ? "signing"
        : awaitingApproval
          ? "awaiting_approval"
          : connected
            ? "connected"
            : "disconnected";

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const nextDevice = await ledgerService.connect();
      setDevice(nextDevice);
      setConnected(true);
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : "Ledger connection failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setConnecting(true);
    try {
      await ledgerService.disconnect();
      setConnected(false);
      setAwaitingApproval(false);
      setSigning(false);
      setCurrentSummary(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ledger disconnect failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const startApproval = useCallback((summary: LedgerTransactionSummary) => {
    setError(null);
    setSuccess(false);
    setCurrentSummary(summary);
    setAwaitingApproval(true);
  }, []);

  const clearApproval = useCallback(() => {
    setAwaitingApproval(false);
    setCurrentSummary(null);
  }, []);

  const signTransaction = useCallback(async (request: LedgerSignRequest) => {
    setError(null);
    setSigning(true);
    setAwaitingApproval(false);
    setSuccess(false);

    try {
      const response = await ledgerService.signTransaction(request);
      setLastSignature(response.signature);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ledger signing failed");
      throw err;
    } finally {
      setSigning(false);
    }
  }, []);

  const setSuccessState = useCallback((signature: string | null) => {
    setSuccess(true);
    setError(null);
    if (signature) setLastSignature(signature);
  }, []);

  const setErrorState = useCallback((message: string | null) => {
    setSuccess(false);
    setError(message);
  }, []);

  const resetTransientState = useCallback(() => {
    setAwaitingApproval(false);
    setSigning(false);
    setSuccess(false);
    setError(null);
    setCurrentSummary(null);
  }, []);

  const value = useMemo<LedgerContextValue>(
    () => ({
      connected,
      connecting,
      awaitingApproval,
      signing,
      success,
      error,
      device,
      lastSignature,
      connectionState,
      currentSummary,
      connect,
      disconnect,
      startApproval,
      clearApproval,
      signTransaction,
      setSuccessState,
      setErrorState,
      resetTransientState,
    }),
    [
      connected,
      connecting,
      awaitingApproval,
      signing,
      success,
      error,
      device,
      lastSignature,
      connectionState,
      currentSummary,
      connect,
      disconnect,
      startApproval,
      clearApproval,
      signTransaction,
      setSuccessState,
      setErrorState,
      resetTransientState,
    ],
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedgerContext() {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error("useLedgerContext must be used inside LedgerProvider");
  }
  return context;
}
