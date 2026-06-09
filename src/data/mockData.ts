import type {
  ChatSummary,
  CurrentUser,
  LedgerDevice,
  QuickAction,
  Strings,
  ToolItem,
  Wallet,
} from "@/types";

export const currentUser: CurrentUser = {
  username: "Prajwal",
  fullAddress: "",
  shortAddress: "Ledger not connected",
  avatarInitial: "P",
};

export const walletData: Wallet = {
  ledgerAddress: null,
  devnetBalanceSol: null,
  lastTransaction: null,
  connectionStatus: "Disconnected",
};

export const recentTransactions = [] as const;

export const chats: ChatSummary[] = [];

export const tools: ToolItem[] = [
  { id: "address", label: "Get Address", icon: "Wallet" },
  { id: "balance", label: "Check Balance", icon: "BadgeDollarSign" },
  { id: "send", label: "Send SOL", icon: "Send" },
  { id: "create-token", label: "Create Token", icon: "Coins" },
];

export const quickActions: QuickAction[] = [
  { id: "q1", label: "Get Address", prompt: "get my address" },
  { id: "q2", label: "Check Balance", prompt: "check my balance" },
  { id: "create-token", label: "Create Token", prompt: "create token" },
];

export const ledgerDevice: LedgerDevice = {
  id: "ledger-speculos",
  name: "Speculos Emulator",
  type: "speculos",
  connectionMethod: "unknown",
};

export const strings: Strings = {
  appName: "Solana Copilot",
  appBadge: "LEDGER",
  appSubtitle: "Ledger-gated Solana agent",
  newChat: "New Chat",
  chatsHeading: "Chats",
  toolsHeading: "Commands",
  greeting: () => "hey, gm!",
  greetingSub:
    "This is a Ledger-gated Solana agent.",
  inputPlaceholder: "Try: get my address, check my balance, send 0.1 sol to ADDRESS, create token NAME",
  footerNotice:
    "Your AI copilot for Solana. Explore wallets, check balances, and execute transactions with Ledger-backed security.",
  ledgerLabel: "Ledger",
  viewPortfolio: "Disabled",
  assetsHeading: "Disabled",
  walletHeading: "Wallet Status",
  recentHeading: "Transactions",
  ledgerHeading: "Ledger Status",
  ledgerStatusText: "Speculos Emulator",
  approveLabel: "Approve on Ledger",
  viewExplorer: "View on Explorer",
  awaiting: "Awaiting Approval",
  broadcasting: "Broadcasting",
  confirmed: "Confirmed",
  txSolTransfer: "SOL Transfer",
  txWarning: "Review the transaction on Ledger before approving the signature.",
  successTitle: "Transaction Confirmed",
  successBody: "The signed transaction was broadcast to Solana Devnet.",
  signatureLabel: "Signature",
  network: "Network",
  fee: "Network Fee",
  from: "From",
  to: "To",
  amount: "Amount",
  createToken: "Create Token",
};
