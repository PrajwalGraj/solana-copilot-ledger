import { Loader2, ShieldCheck } from "lucide-react";
import type { LedgerTransactionSummary } from "@/services/ledger/ledger.types";

export type ApprovalPanelStatus =
  | "preparing"
  | "awaiting_ledger_approval"
  | "signing"
  | "broadcasting"
  | "success"
  | "failed";

interface TransactionApprovalPanelProps {
  summary: LedgerTransactionSummary;
  status: ApprovalPanelStatus;
  error?: string | null;
}

const statusLabel: Record<ApprovalPanelStatus, string> = {
  preparing: "Preparing",
  awaiting_ledger_approval: "Awaiting Ledger Approval",
  signing: "Signing",
  broadcasting: "Broadcasting",
  success: "Success",
  failed: "Failed",
};

export function TransactionApprovalPanel({
  summary,
  status,
  error,
}: TransactionApprovalPanelProps) {
  const running =
    status === "preparing" ||
    status === "awaiting_ledger_approval" ||
    status === "signing" ||
    status === "broadcasting";

  return (
    <div className="glass-card rounded-2xl border border-primary/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">Transaction Approval</div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-foreground">
          {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
          {statusLabel[status]}
        </span>
      </div>

      {summary.details?.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {summary.details.map((detail) => (
            <PanelRow key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <PanelRow label="Transaction Type" value={summary.title} />
          <PanelRow label="Amount" value={summary.amount} />
          <PanelRow label="Recipient" value={summary.recipient} />
          <PanelRow label="Network" value={summary.network} />
          <PanelRow label="Fee" value={summary.estimatedFee} />
          <PanelRow label="Status" value={statusLabel[status]} />
        </div>
      )}

      <div className="mt-2 text-xs text-muted-foreground">{summary.description}</div>

      {error ? (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-strong">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}
