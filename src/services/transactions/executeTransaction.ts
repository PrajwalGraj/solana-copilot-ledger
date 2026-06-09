import type {
  LedgerSignRequest,
  LedgerSignResponse,
  LedgerTransactionSummary,
} from "@/services/ledger/ledger.types";

export type TransactionPipelineStatus =
  | "preparing"
  | "awaiting_ledger_approval"
  | "signing"
  | "broadcasting"
  | "success"
  | "failed";

export interface ExecuteTransactionInput {
  build: () => Promise<{ transaction: unknown; summary: LedgerTransactionSummary }> | {
    transaction: unknown;
    summary: LedgerTransactionSummary;
  };
  signWithLedger: (request: LedgerSignRequest) => Promise<LedgerSignResponse>;
  broadcastSignedTransaction: (signedTransaction: unknown) => Promise<{ signature: string }>;
  onStatusChange?: (status: TransactionPipelineStatus) => void;
  onSummaryReady?: (summary: LedgerTransactionSummary) => void;
}

export interface ExecuteTransactionResult {
  summary: LedgerTransactionSummary;
  signature: string;
  signedTransaction: unknown;
}

function makeRequestId() {
  return `ledger-req-${Math.random().toString(36).slice(2, 10)}`;
}

export async function executeTransaction(
  input: ExecuteTransactionInput,
): Promise<ExecuteTransactionResult> {
  const notify = (status: TransactionPipelineStatus) => input.onStatusChange?.(status);

  try {
    notify("preparing");
    const built = await input.build();
    input.onSummaryReady?.(built.summary);

    notify("awaiting_ledger_approval");
    notify("signing");

    const signRequest: LedgerSignRequest = {
      requestId: makeRequestId(),
      transaction: built.transaction,
      summary: built.summary,
      createdAt: new Date().toISOString(),
    };

    const signed = await input.signWithLedger(signRequest);

    notify("broadcasting");
    const broadcastResult = await input.broadcastSignedTransaction(signed.signedTransaction);

    notify("success");

    return {
      summary: built.summary,
      signature: broadcastResult.signature || signed.signature,
      signedTransaction: signed.signedTransaction,
    };
  } catch (error) {
    notify("failed");
    throw error;
  }
}
