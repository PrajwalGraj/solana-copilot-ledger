import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Plus, Usb } from "lucide-react";
import type { ChatSummary, CurrentUser, ToolItem } from "@/types";
import type { LedgerStatus } from "@/services/ledger/ledger.types";
import { strings } from "@/data/mockData";
import { LedgerStatusBadge } from "@/components/wallet/LedgerStatusBadge";
import { SolanaLogo } from "./SolanaLogo";

interface LeftSidebarProps {
  user: CurrentUser;
  chats: ChatSummary[];
  tools: ToolItem[];
  activeChatId?: string;
  ledgerStatus: LedgerStatus;
  onConnectLedger: () => Promise<void>;
  onDisconnectLedger: () => Promise<void>;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onSelectTool: (id: string) => void;
}

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!C) return null;
  return <C className={className} />;
}

export function LeftSidebar({
  user,
  chats,
  tools,
  activeChatId,
  ledgerStatus,
  onConnectLedger,
  onDisconnectLedger,
  onNewChat,
  onSelectChat,
  onSelectTool,
}: LeftSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-sidebar/70 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <SolanaLogo size={36} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {strings.appName}
            </span>
            <span className="rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {strings.appBadge}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{strings.appSubtitle}</span>
        </div>
      </div>

      {/* New Chat */}
      <div className="px-4 pt-5">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl solana-gradient px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{strings.newChat}</span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </motion.button>
      </div>

      {/* Chats */}
      <div className="mt-6 px-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
          {strings.chatsHeading}
        </p>
        <div className="flex max-h-94 flex-col gap-0.5 overflow-y-auto pr-1 scrollbar-thin">
          {chats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
              Real chat history will appear here.
            </div>
          ) : null}
          {chats.map((c) => {
            const active = c.id === activeChatId;
            return (
              <button
                key={c.id}
                onClick={() => onSelectChat(c.id)}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all",
                  active
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                ].join(" ")}
              >
                <Icon name={c.icon} className="h-4 w-4 shrink-0 opacity-70" />
                <span className="flex-1 truncate">{c.title}</span>
                <span className="text-[10px] text-muted-strong">{c.timestamp}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="mt-6 px-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
          {strings.toolsHeading}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className="flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-xs text-muted-foreground transition-all hover:border-border hover:bg-white/[0.03] hover:text-foreground"
            >
              <Icon name={t.icon} className="h-3.5 w-3.5" />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 px-3 flex flex-col min-h-0">
        <div className="flex shrink-0 flex-col items-start gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-3 py-1.5 backdrop-blur">
            <Usb className="h-3.5 w-3.5 text-foreground" />
            <span className="text-xs font-medium text-foreground">{strings.ledgerLabel}</span>
            <LedgerStatusBadge status={ledgerStatus} />
          </div>
          <button
            onClick={() => {
              if (ledgerStatus.connected) {
                void onDisconnectLedger();
                return;
              }
              void onConnectLedger();
            }}
            disabled={ledgerStatus.connecting || ledgerStatus.signing || ledgerStatus.awaitingApproval}
            className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-border bg-white/[0.03] px-3 text-xs font-medium text-foreground hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ledgerStatus.connecting
              ? "Connecting..."
              : ledgerStatus.connected
                ? "Disconnect"
                : "Connect"}
          </button>
        </div>
      </div>

    
    </aside>
  );
}
