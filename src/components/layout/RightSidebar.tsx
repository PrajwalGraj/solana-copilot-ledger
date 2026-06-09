import type { RecentTransaction, Wallet } from "@/types";
import type { LedgerStatus } from "@/services/ledger/ledger.types";
import { WalletCard } from "@/components/wallet/WalletCard";
import { RecentTransactionsCard } from "@/components/wallet/RecentTransactionsCard";
import { LedgerDeviceCard } from "@/components/wallet/LedgerDeviceCard";

interface RightSidebarProps {
  wallet: Wallet;
  recent: RecentTransaction[];
  ledgerStatus: LedgerStatus;
  onConnectLedger: () => Promise<void>;
  onDisconnectLedger: () => Promise<void>;
}

export function RightSidebar({
  wallet,
  recent,
  ledgerStatus,
  onConnectLedger,
  onDisconnectLedger,
}: RightSidebarProps) {
  return (
    <aside className="h-full w-full overflow-y-auto border-l border-border bg-sidebar/40 backdrop-blur-xl">
      <div className="flex flex-col gap-4 p-4">
        <WalletCard wallet={wallet} />
        <RecentTransactionsCard items={recent} />
        <LedgerDeviceCard
          status={ledgerStatus}
          onConnect={onConnectLedger}
          onDisconnect={onDisconnectLedger}
        />
      </div>
    </aside>
  );
}
