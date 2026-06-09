import type { LedgerTransactionSummary } from "@/services/ledger/ledger.types";

export interface BuildSwapTransactionInput {
  fromAmount: number;
  fromToken: string;
  toToken: string;
  network: string;
}

export interface TransactionBuildResult {
  transaction: unknown;
  summary: LedgerTransactionSummary;
}

export function buildSwapTransaction(input: BuildSwapTransactionInput): TransactionBuildResult {
  const transaction = {
    kind: "swap",
    payload: {
      fromAmount: input.fromAmount,
      fromToken: input.fromToken,
      toToken: input.toToken,
      network: input.network,
    },
  };

  return {
    transaction,
    summary: {
      title: "Swap",
      description: `Swap ${input.fromAmount} ${input.fromToken} to ${input.toToken}`,
      amount: `${input.fromAmount} ${input.fromToken}`,
      recipient: "Liquidity Pool",
      network: input.network,
      estimatedFee: "TBD",
    },
  };
}
