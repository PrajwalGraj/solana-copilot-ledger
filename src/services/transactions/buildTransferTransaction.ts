import type { LedgerTransactionSummary } from "@/services/ledger/ledger.types";

export interface BuildTransferTransactionInput {
  amount: number;
  token: string;
  recipient: string;
  network: string;
}

export interface TransactionBuildResult {
  transaction: unknown;
  summary: LedgerTransactionSummary;
}

export function buildTransferTransaction(
  input: BuildTransferTransactionInput,
): TransactionBuildResult {
  const transaction = {
    kind: "transfer",
    payload: {
      amount: input.amount,
      token: input.token,
      recipient: input.recipient,
      network: input.network,
    },
  };

  return {
    transaction,
    summary: {
      title: "Transfer",
      description: `Transfer ${input.amount} ${input.token} to ${input.recipient}`,
      amount: `${input.amount} ${input.token}`,
      recipient: input.recipient,
      network: input.network,
      estimatedFee: "TBD",
    },
  };
}
