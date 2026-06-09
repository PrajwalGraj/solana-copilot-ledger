import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, ChatSummary, RecentTransaction, Transaction, Wallet } from "@/types";
import type { LedgerStatus, LedgerTransactionSummary } from "@/services/ledger/ledger.types";
import type { ApprovalPanelStatus } from "@/components/chat/TransactionApprovalPanel";
import { ledgerDevice, walletData } from "@/data/mockData";

const API_BASE_URL = "http://127.0.0.1:5050/api/chat";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultLedgerStatus: LedgerStatus = {
  connected: false,
  connecting: false,
  awaitingApproval: false,
  signing: false,
  success: false,
  error: null,
  device: ledgerDevice,
  lastSignature: null,
  connectionState: "disconnected",
};

interface BackendState {
  wallet: Wallet;
  recentTransactions: RecentTransaction[];
  chats: ChatSummary[];
  ledger: Pick<LedgerStatus, "connected" | "error" | "lastSignature">;
}

interface ChatEvent {
  type: string;
  message?: string;
  summary?: LedgerTransactionSummary;
  signature?: string;
  explorerUrl?: string;
  wallet?: Wallet;
  recentTransactions?: RecentTransaction[];
  chats?: ChatSummary[];
  ledger?: Pick<LedgerStatus, "connected" | "error" | "lastSignature">;
  transaction?: {
    id: string;
    kind?: Transaction["kind"];
    title?: string;
    amount: number;
    recipient: string;
    sender: string;
    owner?: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    supply?: number;
    mintAddress?: string;
    tokenAccountAddress?: string;
    network: string;
    feeSol: number;
    status: Transaction["status"];
    signature?: string;
  };
  balanceSol?: number;
  address?: string;
}

function buildTransactionCard(
  summary: LedgerTransactionSummary,
  sender: string,
  status: Transaction["status"],
  signature?: string,
  transactionData?: ChatEvent["transaction"],
): Transaction {
  const amountValue = Number(summary.amount.replace(/[^0-9.]/g, "") || 0);
  const kind = transactionData?.kind ?? "send";

  if (kind === "token_creation") {
    return {
      id: uid("tx"),
      kind,
      title: transactionData?.title ?? summary.title,
      fromLabel: "Owner",
      fromAddress: transactionData?.owner ?? sender,
      toLabel: "Mint Address",
      toAddress: transactionData?.mintAddress ?? summary.recipient,
      owner: transactionData?.owner ?? sender,
      name: transactionData?.name,
      symbol: transactionData?.symbol,
      decimals: transactionData?.decimals,
      supply: transactionData?.supply,
      mintAddress: transactionData?.mintAddress,
      tokenAccountAddress: transactionData?.tokenAccountAddress,
      amount: transactionData?.supply ?? amountValue,
      token: transactionData?.symbol ?? "TOKEN",
      feeSol: (transactionData?.feeSol ?? Number(summary.estimatedFee.replace(" SOL", ""))) || 0,
      network: transactionData?.network ?? summary.network,
      status,
      signature,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    id: uid("tx"),
    kind: "send",
    title: summary.title,
    fromLabel: "Ledger",
    fromAddress: sender,
    toLabel: "Recipient",
    toAddress: summary.recipient,
    amount: amountValue,
    token: "SOL",
    feeSol: Number(summary.estimatedFee.replace(" SOL", "")) || 0,
    network: summary.network,
    status,
    signature,
    timestamp: new Date().toISOString(),
  };
}

function mapLedgerStatus(
  ledger: Pick<LedgerStatus, "connected" | "error" | "lastSignature"> | undefined,
  current: LedgerStatus,
  overrides?: Partial<LedgerStatus>,
): LedgerStatus {
  const connected = overrides?.connected ?? ledger?.connected ?? current.connected;
  const error = overrides?.error ?? ledger?.error ?? null;
  const signing = overrides?.signing ?? false;
  const awaitingApproval = overrides?.awaitingApproval ?? false;
  const connecting = overrides?.connecting ?? false;
  const success = overrides?.success ?? current.success;

  return {
    ...current,
    connected,
    error,
    lastSignature: overrides?.lastSignature ?? ledger?.lastSignature ?? current.lastSignature,
    device: ledgerDevice,
    connecting,
    awaitingApproval,
    signing,
    success,
    connectionState: error
      ? "error"
      : signing
        ? "signing"
        : awaitingApproval
          ? "awaiting_approval"
          : connecting
            ? "connecting"
            : connected
              ? "connected"
              : "disconnected",
  };
}

export function useChatFlow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [approvalPanel, setApprovalPanel] = useState<{
    summary: LedgerTransactionSummary;
    status: ApprovalPanelStatus;
    error?: string | null;
  } | null>(null);
  const [wallet, setWallet] = useState<Wallet>(walletData);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>([]);
  const [ledgerStatus, setLedgerStatus] = useState<LedgerStatus>(defaultLedgerStatus);
  const [activeTxId, setActiveTxId] = useState<string | null>(null);

  const syncState = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/state`);
      if (!response.ok) {
        throw new Error("Failed to load wallet state");
      }

      const state = (await response.json()) as BackendState;
      setWallet(state.wallet);
      setRecentTransactions(state.recentTransactions);
      setChatHistory(state.chats);
      setLedgerStatus((current) => mapLedgerStatus(state.ledger, current));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reach backend";
      setLedgerStatus((current) => mapLedgerStatus(undefined, current, { error: message }));
    }
  }, []);

  useEffect(() => {
    void syncState();
  }, [syncState]);

  const updateTransactionCard = useCallback(
    (status: Transaction["status"], signature?: string) => {
      if (!activeTxId) return;

      setMessages((prev) =>
        prev.map((message) => {
          if (message.card?.type !== "transaction" || message.card.data.id !== activeTxId) {
            return message;
          }

          return {
            ...message,
            card: {
              type: "transaction",
              data: {
                ...message.card.data,
                status,
                signature: signature ?? message.card.data.signature,
              },
            },
          };
        }),
      );
    },
    [activeTxId],
  );

  const connectLedger = useCallback(async () => {
    setLedgerStatus((current) =>
      mapLedgerStatus(undefined, current, { connecting: true, error: null, success: false }),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/connect`, { method: "POST" });
      const data = (await response.json()) as { connected?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to connect to Speculos");
      }

      setLedgerStatus((current) =>
        mapLedgerStatus(
          { connected: Boolean(data.connected), error: null, lastSignature: current.lastSignature },
          current,
        ),
      );
      await syncState();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect to Speculos";
      setLedgerStatus((current) => mapLedgerStatus(undefined, current, { error: message }));
      throw error;
    }
  }, [syncState]);

  const disconnectLedger = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/disconnect`, { method: "POST" });
    } finally {
      setLedgerStatus((current) =>
        mapLedgerStatus(
          { connected: false, error: null, lastSignature: current.lastSignature },
          current,
          { success: false },
        ),
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setMessages((prev) => [...prev, { id: uid("m"), role: "user", content: trimmed }]);

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        const message = body.error ?? "Backend request failed";

        setMessages((prev) => [
          ...prev,
          { id: uid("m"), role: "assistant", content: message },
        ]);
        setLedgerStatus((current) => mapLedgerStatus(undefined, current, { error: message }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setLedgerStatus((current) =>
        mapLedgerStatus(undefined, current, { error: null, success: false }),
      );

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as ChatEvent;

          if (event.type === "status" && event.message) {
            setMessages((prev) => [
              ...prev,
              { id: uid("m"), role: "assistant", content: event.message },
            ]);

            if (event.message.includes("Connecting to Ledger")) {
              setLedgerStatus((current) =>
                mapLedgerStatus(event.ledger, current, { connecting: true }),
              );
              } else if (
                event.message.includes("Waiting for approval on Ledger")
              ) {
              setLedgerStatus((current) =>
                mapLedgerStatus(event.ledger, current, {
                  awaitingApproval: true,
                  connecting: false,
                }),
              );
              setApprovalPanel((current) =>
                current
                  ? { ...current, status: "awaiting_ledger_approval", error: null }
                  : current,
              );
              updateTransactionCard("awaiting");
              } else if (event.message.includes("Building token transaction")) {
                setApprovalPanel((current) =>
                  current ? { ...current, status: "preparing", error: null } : current,
                );
                updateTransactionCard("preparing");
              } else if (event.message.includes("Preparing mint account")) {
                setApprovalPanel((current) =>
                  current ? { ...current, status: "preparing", error: null } : current,
                );
                updateTransactionCard("preparing");
              } else if (event.message.includes("Transaction signed")) {
              setLedgerStatus((current) =>
                mapLedgerStatus(event.ledger, current, {
                  signing: false,
                  awaitingApproval: false,
                  success: false,
                }),
              );
              setApprovalPanel((current) =>
                current ? { ...current, status: "signing", error: null } : current,
              );
              updateTransactionCard("signing");
            } else if (event.message.includes("Broadcasting")) {
              setLedgerStatus((current) =>
                mapLedgerStatus(event.ledger, current, { signing: true, awaitingApproval: false }),
              );
              setApprovalPanel((current) =>
                current ? { ...current, status: "broadcasting", error: null } : current,
              );
              updateTransactionCard("broadcasting");
            } else if (event.message.includes("Building transaction")) {
              setApprovalPanel((current) =>
                current ? { ...current, status: "preparing", error: null } : current,
              );
              updateTransactionCard("preparing");
            }
          }

          if (event.type === "address" && event.address) {
            setMessages((prev) => [
              ...prev,
              {
                id: uid("m"),
                role: "assistant",
                content: `Ledger address: ${event.address}`,
              },
            ]);
          }

          if (event.type === "balance" && event.address != null && event.balanceSol != null) {
            setMessages((prev) => [
              ...prev,
              {
                id: uid("m"),
                role: "assistant",
                content: `Devnet balance: ${event.balanceSol} SOL`,
                details: [
                  { label: "Address", value: event.address },
                  { label: "Network", value: "Solana Devnet" },
                ],
              },
            ]);
          }

          if (event.type === "transaction_prepared" && event.summary && event.transaction) {
            const tx = buildTransactionCard(
              event.summary,
              event.transaction.sender,
              "awaiting",
              undefined,
              event.transaction,
            );

            setActiveTxId(tx.id);
            setApprovalPanel({
              summary: event.summary,
              status: "preparing",
              error: null,
            });
            setMessages((prev) => [
              ...prev,
              {
                id: uid("m"),
                role: "assistant",
                content: "Transaction prepared for Ledger review.",
                details: [
                  { label: "Amount", value: event.summary.amount },
                  { label: "To", value: event.summary.recipient },
                  { label: "From", value: event.transaction.sender },
                ],
                card: { type: "transaction", data: tx },
              },
            ]);
          }

          if (event.type === "transaction_result" && event.summary && event.transaction) {
            const tx = buildTransactionCard(
              event.summary,
              event.transaction.sender,
              "confirmed",
              event.signature,
              event.transaction,
            );

            setMessages((prev) => [
              ...prev,
              {
                id: uid("m"),
                role: "assistant",
                content: "Confirmed on Solana Devnet.",
                card: { type: "success", data: tx },
              },
            ]);
            setApprovalPanel((current) =>
              current ? { ...current, status: "success", error: null } : current,
            );
            updateTransactionCard("confirmed", event.signature);
          }

          if (event.type === "wallet_state") {
            if (event.wallet) setWallet(event.wallet);
            if (event.recentTransactions) setRecentTransactions(event.recentTransactions);
            if (event.chats) setChatHistory(event.chats);
            setLedgerStatus((current) =>
              mapLedgerStatus(event.ledger, current, {
                connecting: false,
                signing: false,
                awaitingApproval: false,
              }),
            );
          }

          if (event.type === "error") {
            const message =
              event.message?.includes("Signing was rejected on Ledger")
                ? "Transaction rejected on Ledger device."
                : (event.message ?? "Request failed");
            setMessages((prev) => [
              ...prev,
              { id: uid("m"), role: "assistant", content: message },
            ]);
            setApprovalPanel((current) =>
              current ? { ...current, status: "failed", error: message } : current,
            );
            setLedgerStatus((current) =>
              mapLedgerStatus(event.ledger, current, {
                error: message,
                connecting: false,
                signing: false,
                awaitingApproval: false,
                success: false,
              }),
            );
            updateTransactionCard("failed");
          }
        }

        if (done) break;
      }

      await syncState();
    },
    [syncState, updateTransactionCard],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setApprovalPanel(null);
    setActiveTxId(null);
  }, []);

  return {
    messages,
    approvalPanel,
    wallet,
    recentTransactions,
    chatHistory,
    ledgerStatus,
    sendMessage,
    resetChat,
    connectLedger,
    disconnectLedger,
  };
}
