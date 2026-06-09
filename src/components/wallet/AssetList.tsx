import { motion } from "framer-motion";
import type { Asset } from "@/types";
import { formatAmount, formatPercent, formatUsd } from "@/lib/format";
import { strings } from "@/data/mockData";

interface AssetListProps {
  assets: Asset[];
  onViewPortfolio?: () => void;
}

function AssetRow({ a }: { a: Asset }) {
  const up = a.change24h >= 0;
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]"
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}99)` }}
      >
        {a.symbol.slice(0, 3)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{a.symbol}</span>
          <span className="text-sm font-medium text-foreground">{formatUsd(a.usdValue)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {formatAmount(a.amount, a.symbol === "BONK" ? 0 : 4)} {a.symbol}
          </span>
          <span
            className={[
              "text-[11px] font-medium",
              up ? "text-success" : "text-destructive",
            ].join(" ")}
          >
            {formatPercent(a.change24h)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function AssetList({ assets, onViewPortfolio }: AssetListProps) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
          {strings.assetsHeading}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {assets.map((a) => (
          <AssetRow key={a.symbol} a={a} />
        ))}
      </div>
      <button
        onClick={onViewPortfolio}
        className="mt-3 w-full rounded-xl border border-border bg-white/[0.02] py-2 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
      >
        {strings.viewPortfolio}
      </button>
    </div>
  );
}