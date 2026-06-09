import type { LedgerDevice as LedgerServiceDevice } from "@/services/ledger/ledger.types";

export interface CurrentUser {
  username: string;
  fullAddress: string;
  shortAddress: string;
  avatarInitial: string;
}

export interface Wallet {
  ledgerAddress: string | null;
  devnetBalanceSol: number | null;
  lastTransaction: string | null;
  connectionStatus: "Connected" | "Disconnected";
}

export interface Asset {
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  change24h: number;
  color: string;
}

export type TransactionStatus =
  | "preparing"
  | "awaiting"
  | "signing"
  | "broadcasting"
  | "confirmed"
  | "failed";

export type TransactionKind = "send" | "token_creation";

export interface Transaction {
  id: string;
  kind: TransactionKind;
  title: string;
  fromLabel?: string;
  fromAddress?: string;
  toLabel?: string;
  toAddress?: string;
  owner?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  supply?: number;
  mintAddress?: string;
  tokenAccountAddress?: string;
  amount: number;
  token: string;
  secondaryAmount?: number;
  secondaryToken?: string;
  feeSol: number;
  network: string;
  status: TransactionStatus;
  signature?: string;
  timestamp: string;
}

export interface RecentTransaction {
  id: string;
  kind: TransactionKind;
  primary: string;
  secondary?: string;
  timestamp: string;
  signature?: string;
  symbol?: string;
  mintAddress?: string;
  explorerUrl?: string;
}

export interface ChatSummary {
  id: string;
  title: string;
  icon: string;
  timestamp: string;
}

export interface ToolItem {
  id: string;
  label: string;
  icon: string;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

export type LedgerDevice = LedgerServiceDevice;

export type MessageCard =
  | { type: "transaction"; data: Transaction }
  | { type: "success"; data: Transaction };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  details?: { label: string; value: string }[];
  followUp?: string;
  card?: MessageCard;
}

export interface Strings {
  appName: string;
  appBadge: string;
  appSubtitle: string;
  newChat: string;
  chatsHeading: string;
  toolsHeading: string;
  greeting: (name: string) => string;
  greetingSub: string;
  inputPlaceholder: string;
  footerNotice: string;
  ledgerLabel: string;
  viewPortfolio: string;
  assetsHeading: string;
  walletHeading: string;
  recentHeading: string;
  ledgerHeading: string;
  ledgerStatusText: string;
  approveLabel: string;
  viewExplorer: string;
  awaiting: string;
  broadcasting: string;
  confirmed: string;
  txSolTransfer: string;
  txWarning: string;
  successTitle: string;
  successBody: string;
  signatureLabel: string;
  network: string;
  fee: string;
  from: string;
  to: string;
  amount: string;
}
