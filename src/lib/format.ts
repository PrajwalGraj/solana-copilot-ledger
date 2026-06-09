export function shortenAddress(addr: string, head = 4, tail = 4): string {
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatAmount(n: number, maxDecimals = 4): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}

export function formatPercent(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}