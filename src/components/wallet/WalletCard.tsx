import { Copy, CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { Wallet } from "@/types";
import { strings } from "@/data/mockData";

interface WalletCardProps {
  wallet: Wallet;
}

function shorten(value: string | null) {
  if (!value) return "Not available";
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}…${value.slice(-8)}`;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const connected = wallet.connectionStatus === "Connected";

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
          {strings.walletHeading}
        </span>
        <button
          type="button"
          disabled={!wallet.ledgerAddress}
          onClick={() => {
            if (!wallet.ledgerAddress) return;
            void navigator.clipboard.writeText(wallet.ledgerAddress);
          }}
          className="rounded-md p-1 text-muted-strong hover:bg-white/[0.05] hover:text-foreground disabled:opacity-40"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <Row label="Ledger Address" value={wallet.ledgerAddress ?? "Run `get my address`"} mono />
        <Row
          label="Current Devnet Balance"
          value={
            wallet.devnetBalanceSol == null
              ? "Run `check my balance`"
              : `${wallet.devnetBalanceSol} SOL`
          }
        />
 
        <Row
          label="Connection Status"
          value={wallet.connectionStatus}
          icon={
            connected ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-strong" />
            )
          }
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2">
      <div className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-strong">{label}</div>
      <div
        className={`flex items-center gap-2 text-foreground ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
