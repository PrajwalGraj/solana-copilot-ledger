import type { ReactNode } from "react";
import type { LedgerStatus } from "@/services/ledger/ledger.types";
import { LedgerStatusBadge } from "@/components/wallet/LedgerStatusBadge";

interface LedgerDeviceCardProps {
  status: LedgerStatus;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function LedgerDeviceCard({
  status,
  onConnect,
  onDisconnect,
}: LedgerDeviceCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
          Ledger Status
        </div>
        <LedgerStatusBadge status={status} />
      </div>

      {/* <div className="space-y-2 text-sm">
        <InfoRow label="Status" value={status.connected ? "Connected" : "Disconnected"} />
        <InfoRow label="Device" value="Speculos Emulator" />
        <InfoRow label="Transport" value="Speculos" />
        <InfoRow label="Network" value="Solana Devnet" />
        <InfoRow label="APDU" value="localhost:9999" mono />
        <InfoRow label="API" value="localhost:5001" mono />
      </div> */}

      {/* <div className="mt-3">
        <button
          onClick={() => {
            if (status.connected) {
              void onDisconnect();
              return;
            }
            void onConnect();
          }}
          disabled={status.connecting || status.signing || status.awaitingApproval}
          className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.connecting
            ? "Connecting..."
            : status.connected
              ? "Disconnect Ledger"
              : "Connect Ledger"}
        </button>
      </div> */}

      {status.error ? (
        <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {status.error}
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2">
      <div className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-strong">{label}</div>
      <div className={`text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}
