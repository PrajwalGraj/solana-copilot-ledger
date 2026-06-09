import type { LedgerTransactionSummary } from "@/services/ledger/ledger.types";

export interface BuildTokenCreationTransactionInput {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  owner?: string;
  network: string;
}

export interface TransactionBuildResult {
  transaction: unknown;
  summary: LedgerTransactionSummary;
}

export function buildTokenCreationTransaction(
  input: BuildTokenCreationTransactionInput,
): TransactionBuildResult {
  const transaction = {
    kind: "token_creation",
    payload: {
      name: input.name,
      symbol: input.symbol,
      decimals: input.decimals,
      supply: input.supply,
      owner: input.owner,
      network: input.network,
    },
  };

  return {
    transaction,
    summary: {
      title: "Token Creation Preview",
      description: "Create a standard SPL token and mint the initial supply.",
      amount: `${input.supply.toLocaleString()} ${input.symbol}`,
      recipient: input.owner ?? "Token Mint",
      network: input.network,
      estimatedFee: "TBD",
      details: [
        { label: "Name", value: input.name },
        { label: "Symbol", value: input.symbol },
        { label: "Decimals", value: String(input.decimals) },
        { label: "Supply", value: input.supply.toLocaleString() },
        { label: "Owner", value: input.owner ?? "Ledger" },
        { label: "Network", value: input.network },
      ],
    },
  };
}
