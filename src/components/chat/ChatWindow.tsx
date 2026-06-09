import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Menu, Wallet as WalletIcon } from "lucide-react";
import type { ChatMessage, CurrentUser, QuickAction } from "@/types";
import type { LedgerStatus } from "@/services/ledger/ledger.types";
import { strings } from "@/data/mockData";
import type { ApprovalPanelStatus } from "./TransactionApprovalPanel";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { TransactionCard } from "./TransactionCard";
import { SuccessCard } from "./SuccessCard";
import { ChatInputBar } from "./ChatInputBar";
import { TransactionApprovalPanel } from "./TransactionApprovalPanel";

interface ChatWindowProps {
  user: CurrentUser;
  messages: ChatMessage[];
  quickActions: QuickAction[];
  ledgerStatus: LedgerStatus;
  approvalPanel: {
    summary: {
      title: string;
      description: string;
      amount: string;
      recipient: string;
      network: string;
      estimatedFee: string;
    };
    status: ApprovalPanelStatus;
    error?: string | null;
  } | null;
  onSend: (text: string) => void;
  onConnectLedger: () => Promise<void>;
  onDisconnectLedger: () => Promise<void>;
  onOpenLeft: () => void;
  onOpenRight: () => void;
}

export function ChatWindow({
  user,
  messages,
  quickActions,
  ledgerStatus,
  approvalPanel,
  onSend,
  onConnectLedger,
  onDisconnectLedger,
  onOpenLeft,
  onOpenRight,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeApprovalPanel = approvalPanel;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <section className="flex h-full w-full flex-col">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 px-6 pb-2 pt-6 md:px-10 md:pt-8">
        <div className="flex items-start gap-3">
          <button
            onClick={onOpenLeft}
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/[0.03] text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {strings.greeting(user.username)}
            </h1>
            <p className="mt-1 max-w-2xl whitespace-pre-line text-sm text-muted-foreground">
              {strings.greetingSub}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpenRight}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/[0.03] text-muted-foreground hover:text-foreground xl:hidden"
            aria-label="Open wallet panel"
          >
            <WalletIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 py-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              if (m.role === "user") {
                return <UserMessage key={m.id} content={m.content ?? ""} />;
              }
              return (
                <AssistantMessage
                  key={m.id}
                  content={m.content}
                  details={m.details}
                  followUp={m.followUp}
                >
                  {m.card?.type === "transaction" ? <TransactionCard tx={m.card.data} /> : null}
                  {m.card?.type === "success" ? <SuccessCard tx={m.card.data} /> : null}
                </AssistantMessage>
              );
            })}
          </AnimatePresence>
          {activeApprovalPanel ? (
            <TransactionApprovalPanel
              summary={activeApprovalPanel.summary}
              status={activeApprovalPanel.status}
              error={activeApprovalPanel.error}
            />
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 md:px-10 md:pb-6">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInputBar quickActions={quickActions} onSend={onSend} />
        </div>
      </div>
    </section>
  );
}
