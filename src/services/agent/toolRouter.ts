import { buildSwapTransaction } from "@/services/transactions/buildSwapTransaction";
import { buildTokenCreationTransaction } from "@/services/transactions/buildTokenCreationTransaction";
import { buildTransferTransaction } from "@/services/transactions/buildTransferTransaction";
import {
  executeTransaction,
  type ExecuteTransactionResult,
  type TransactionPipelineStatus,
} from "@/services/transactions/executeTransaction";
import type { LedgerSignRequest, LedgerSignResponse } from "@/services/ledger/ledger.types";

export type AgentToolType = "transfer" | "swap" | "token_creation";

export interface AgentToolExecutionContext {
  prompt: string;
  signWithLedger: (request: LedgerSignRequest) => Promise<LedgerSignResponse>;
  broadcastSignedTransaction: (signedTransaction: unknown) => Promise<{ signature: string }>;
  onStatusChange?: (status: TransactionPipelineStatus) => void;
  onSummaryReady?: (summary: {
    title: string;
    description: string;
    amount: string;
    recipient: string;
    network: string;
    estimatedFee: string;
  }) => void;
}

export interface AgentToolExecutionResult extends ExecuteTransactionResult {
  toolType: AgentToolType;
}

function parsePrompt(prompt: string):
  | { toolType: "transfer"; amount: number; recipient: string }
  | { toolType: "swap"; amount: number; fromToken: string; toToken: string }
  | {
      toolType: "token_creation";
      name: string;
      symbol: string;
      decimals: number;
      supply: number;
    }
  | null {
  const trimmed = prompt.trim();
  const normalized = trimmed.toLowerCase();

  const transferMatch = normalized.match(/send\s+([\d.]+)\s+(\w+)\s+to\s+([a-z0-9_-]+)/i);
  if (transferMatch) {
    return {
      toolType: "transfer",
      amount: Number(transferMatch[1]),
      recipient: transferMatch[3],
    };
  }

  const swapMatch = normalized.match(/swap\s+([\d.]+)\s+(\w+)\s+to\s+(\w+)/i);
  if (swapMatch) {
    return {
      toolType: "swap",
      amount: Number(swapMatch[1]),
      fromToken: swapMatch[2].toUpperCase(),
      toToken: swapMatch[3].toUpperCase(),
    };
  }

  if (/^create\s+token\b/i.test(trimmed)) {
    const body = trimmed.replace(/^create\s+token\b/i, "").trim();
    const fields: Record<string, string> = {};

    for (const rawLine of trimmed.split(/\r?\n/)) {
      const line = rawLine.trim();
      const match = line.match(/^(name|symbol|decimals|supply)\s*:\s*(.+)$/i);
      if (match) {
        fields[match[1].toLowerCase()] = match[2].trim();
      }
    }

    let symbol = fields.symbol ?? null;
    let name = fields.name ?? null;
    let decimals = fields.decimals ?? null;
    let supply = fields.supply ?? null;

    if (!symbol && body) {
      const bareMatch = body.match(/^([A-Za-z0-9]{2,10})\b/);
      if (bareMatch && !/^(name|symbol|decimals|supply)\b/i.test(body)) {
        symbol = bareMatch[1];
      }
    }

    const nameMatch = trimmed.match(/name\s+(.+?)(?=\s+(?:symbol|decimals|supply)\b|$)/i);
    if (nameMatch) name = nameMatch[1].trim();

    const symbolMatch = trimmed.match(/symbol\s+([A-Za-z0-9]{2,10})\b/i);
    if (symbolMatch) symbol = symbolMatch[1];

    const decimalsMatch = trimmed.match(/decimals\s+([0-9]+)\b/i);
    if (decimalsMatch) decimals = decimalsMatch[1];

    const supplyMatch = trimmed.match(/supply\s+([0-9]+)\b/i);
    if (supplyMatch) supply = supplyMatch[1];

    if (!symbol) {
      return null;
    }

    const normalizedSymbol = symbol.toUpperCase();
    const normalizedName = name?.trim() || normalizedSymbol;
    const normalizedDecimals = decimals == null || decimals === "" ? 9 : Number(decimals);
    const normalizedSupply = supply == null || supply === "" ? 1_000_000 : Number(supply);

    return {
      toolType: "token_creation",
      name: normalizedName,
      symbol: normalizedSymbol,
      decimals: Number.isFinite(normalizedDecimals) ? normalizedDecimals : 9,
      supply: Number.isFinite(normalizedSupply) ? normalizedSupply : 1_000_000,
    };
  }

  return null;
}

export async function executeAgentTool(
  context: AgentToolExecutionContext,
): Promise<AgentToolExecutionResult | null> {
  const parsed = parsePrompt(context.prompt);
  if (!parsed) return null;

  if (parsed.toolType === "transfer") {
    const result = await executeTransaction({
      build: () =>
        buildTransferTransaction({
          amount: parsed.amount,
          token: "SOL",
          recipient: parsed.recipient,
          network: "Solana Mainnet",
        }),
      signWithLedger: context.signWithLedger,
      broadcastSignedTransaction: context.broadcastSignedTransaction,
      onStatusChange: context.onStatusChange,
      onSummaryReady: context.onSummaryReady,
    });
    return { ...result, toolType: parsed.toolType };
  }

  if (parsed.toolType === "swap") {
    const result = await executeTransaction({
      build: () =>
        buildSwapTransaction({
          fromAmount: parsed.amount,
          fromToken: parsed.fromToken,
          toToken: parsed.toToken,
          network: "Solana Mainnet",
        }),
      signWithLedger: context.signWithLedger,
      broadcastSignedTransaction: context.broadcastSignedTransaction,
      onStatusChange: context.onStatusChange,
      onSummaryReady: context.onSummaryReady,
    });
    return { ...result, toolType: parsed.toolType };
  }

  const result = await executeTransaction({
    build: () =>
      buildTokenCreationTransaction({
        name: parsed.name,
        symbol: parsed.symbol,
        decimals: parsed.decimals,
        supply: parsed.supply,
        network: "Solana Mainnet",
      }),
    signWithLedger: context.signWithLedger,
    broadcastSignedTransaction: context.broadcastSignedTransaction,
    onStatusChange: context.onStatusChange,
    onSummaryReady: context.onSummaryReady,
  });

  return { ...result, toolType: parsed.toolType };
}
