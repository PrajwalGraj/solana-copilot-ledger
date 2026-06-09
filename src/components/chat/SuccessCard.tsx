import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";
import type { Transaction } from "@/types";
import { strings } from "@/data/mockData";

interface SuccessCardProps {
  tx: Transaction;
}

export function SuccessCard({ tx }: SuccessCardProps) {
  const sig = tx.signature ?? "";
  const shortSig = sig.length > 24 ? `${sig.slice(0, 14)}…${sig.slice(-10)}` : sig;
  const tokenCreation = tx.kind === "token_creation";
  const explorer = tokenCreation
    ? `https://explorer.solana.com/address/${tx.mintAddress ?? sig}?cluster=devnet`
    : `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
  const title = tokenCreation ? "Token Created Successfully" : strings.successTitle;
  const body = tokenCreation
    ? "The SPL token mint is now live on Solana Devnet."
    : strings.successBody;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="glass-card glow-success relative overflow-hidden rounded-2xl border-success/40 p-4"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
          {tokenCreation ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <InfoBox label="Name" value={tx.name ?? ""} />
              <InfoBox label="Symbol" value={tx.symbol ?? ""} />
              <InfoBox label="Decimals" value={String(tx.decimals ?? 0)} />
              <InfoBox label="Supply" value={`${tx.supply ?? tx.amount} ${tx.symbol ?? tx.token}`} />
              <InfoBox label="Mint Address" value={tx.mintAddress ?? ""} />
              <InfoBox label="Token Account" value={tx.tokenAccountAddress ?? ""} />
            </div>
          ) : null}
          <div className="mt-3 rounded-xl border border-border bg-black/30 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-strong">
              {tokenCreation ? "Transaction Signature" : strings.signatureLabel}
            </div>
            <div className="mt-0.5 font-mono text-xs text-foreground break-all">{shortSig}</div>
          </div>
          <a
            href={explorer}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:bg-success/15"
          >
            {tokenCreation ? "View Mint on Explorer" : strings.viewExplorer}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-black/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-strong">{label}</div>
      <div className="mt-0.5 break-all text-xs text-foreground">{value}</div>
    </div>
  );
}
