import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solana Copilot — Your AI for Solana" },
      {
        name: "description",
        content:
          "Ledger-gated Solana Devnet demo for address lookup, balance lookup, and SOL transfers through Speculos.",
      },
      { property: "og:title", content: "Solana Copilot — Your AI for Solana" },
      {
        property: "og:description",
        content: "Ledger-gated Solana Devnet demo with Speculos signing.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppShell />;
}
