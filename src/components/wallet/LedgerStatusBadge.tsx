import type { LedgerStatus } from "@/services/ledger/ledger.types";

interface LedgerStatusBadgeProps {
  status: LedgerStatus;
}

export function LedgerStatusBadge({ status }: LedgerStatusBadgeProps) {
  const value = status.error
    ? "Error"
    : status.signing
      ? "Signing"
      : status.awaitingApproval
        ? "Awaiting Approval"
        : status.success
          ? "Success"
          : status.connected
            ? "Connected"
            : "Disconnected";

  const tone = status.error
    ? "bg-destructive/15 text-destructive border-destructive/40"
    : status.signing
      ? "bg-primary/15 text-primary border-primary/40"
      : status.awaitingApproval
        ? "bg-warning/15 text-warning border-warning/40"
        : status.success
          ? "bg-success/15 text-success border-success/40"
          : status.connected
            ? "bg-success/15 text-success border-success/40"
            : "bg-muted/20 text-muted-foreground border-border";

  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>{value}</span>;
}
