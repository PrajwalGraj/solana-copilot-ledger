import { ArrowUpRight, Coins, ExternalLink } from "lucide-react";
import type { RecentTransaction } from "@/types";
import { strings } from "@/data/mockData";

interface RecentTransactionsCardProps {
  items: RecentTransaction[];
}

const kindMeta: Record<RecentTransaction["kind"], { label: string; Icon: typeof ArrowUpRight; tone: string }> = {
  send: { label: "Sent", Icon: ArrowUpRight, tone: "text-destructive bg-destructive/15" },
  token_creation: { label: "Token Created", Icon: Coins, tone: "text-success bg-success/15" },
};

export function RecentTransactionsCard({ items }: RecentTransactionsCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
          {strings.recentHeading}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            No real transactions yet.
          </div>
        ) : null}
        {items.map((t) => {
          const meta = kindMeta[t.kind];
          const I = meta.Icon;
          const explorerUrl = t.explorerUrl ?? (t.mintAddress ? `https://explorer.solana.com/address/${t.mintAddress}?cluster=devnet` : undefined);
          return (
            <div key={t.id} className="rounded-xl px-2 py-2 hover:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${meta.tone}`}>
                  <I className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{meta.label}</span>
                    <span className="text-xs text-muted-strong">{t.timestamp}</span>
                  </div>
                  {t.kind === "token_creation" ? (
                    <div className="mt-1 space-y-0.5">
                      <div className="text-xs text-muted-foreground">
                        Symbol: <span className="font-medium text-foreground">{t.symbol ?? ""}</span>
                      </div>
                      <div className="break-all text-xs text-muted-foreground">
                        Mint: <span className="font-mono text-foreground">{t.mintAddress ?? t.secondary ?? ""}</span>
                      </div>
                      {explorerUrl ? (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-success hover:text-success/80"
                        >
                          Explorer Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">{t.primary}</span>
                      {t.secondary ? (
                        <span className="min-w-0 max-w-[10rem] truncate text-xs text-success">
                          {t.secondary}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
