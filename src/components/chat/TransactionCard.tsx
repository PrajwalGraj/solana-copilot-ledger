import { motion } from "framer-motion";
import { Coins, Loader2, ShieldAlert } from "lucide-react";
import type { Transaction } from "@/types";
import { strings } from "@/data/mockData";

interface TransactionCardProps {
  tx: Transaction;
  onApprove?: (id: string) => void;
}

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const map = {
    preparing: { label: "Preparing", tone: "bg-muted/20 text-muted-foreground border-border" },
    awaiting: { label: strings.awaiting, tone: "bg-warning/15 text-warning border-warning/30" },
    signing: { label: "Signing", tone: "bg-primary/15 text-primary border-primary/30" },
    broadcasting: { label: strings.broadcasting, tone: "bg-primary/15 text-primary border-primary/30" },
    confirmed: { label: strings.confirmed, tone: "bg-success/15 text-success border-success/30" },
    failed: { label: "Failed", tone: "bg-destructive/15 text-destructive border-destructive/30" },
  } as const;
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${m.tone}`}>
      {status === "broadcasting" ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {m.label}
    </span>
  );
}

export function TransactionCard({ tx, onApprove }: TransactionCardProps) {
  const awaiting = tx.status === "awaiting";
  const tokenCreation = tx.kind === "token_creation";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden rounded-2xl"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg solana-gradient text-[11px] font-bold text-white">
            {tokenCreation ? <Coins className="h-3.5 w-3.5" /> : "◎"}
          </div>
          <span className="text-sm font-semibold text-foreground">{tx.title}</span>
        </div>
        <StatusBadge status={tx.status} />
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        {tokenCreation ? (
          <>
            <Row label="Name" value={tx.name ?? ""} />
            <Row label="Symbol" value={tx.symbol ?? ""} />
            <Row label="Decimals" value={String(tx.decimals ?? 0)} />
            <Row label="Supply" value={`${tx.supply ?? tx.amount} ${tx.symbol ?? tx.token}`} highlight />
            <Row label="Owner" value={tx.owner ?? tx.fromAddress ?? ""} />
            <Row label="Mint Address" value={tx.mintAddress ?? tx.toAddress ?? ""} />
            <Row label="Token Account" value={tx.tokenAccountAddress ?? ""} />
            <Row label={strings.network} value={tx.network} />
          </>
        ) : (
          <>
            <Row label={strings.from} value={`${tx.fromLabel} (${tx.fromAddress})`} />
            <Row label={strings.to} value={`${tx.toLabel} (${tx.toAddress})`} />
            <Row label={strings.amount} value={`${tx.amount} ${tx.token}`} highlight />
            <Row label={strings.fee} value={`~${tx.feeSol} SOL`} />
            <Row label={strings.network} value={tx.network} />
          </>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border bg-warning/[0.06] px-4 py-2.5 text-xs text-warning">
        <ShieldAlert className="h-3.5 w-3.5" />
        <span>{strings.txWarning}</span>
      </div>
      {awaiting && onApprove ? (
        <div className="border-t border-border p-3">
          <button
            onClick={() => onApprove(tx.id)}
            className="w-full rounded-xl solana-gradient py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {strings.approveLabel}
          </button>
        </div>
      ) : null}
    </motion.div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-strong">{label}</span>
      <span
        className={`text-sm ${highlight ? "font-semibold text-foreground" : "text-foreground/90"} break-all`}
      >
        {value}
      </span>
    </div>
  );
}