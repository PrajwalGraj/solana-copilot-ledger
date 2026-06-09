import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { currentUser, quickActions, tools } from "@/data/mockData";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChatFlow } from "@/hooks/useChatFlow";

export function AppShell() {
  const {
    messages,
    sendMessage,
    resetChat,
    approvalPanel,
    wallet,
    recentTransactions,
    chatHistory,
    ledgerStatus,
    connectLedger,
    disconnectLedger,
  } = useChatFlow();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop left */}
      <div className="hidden h-full w-[280px] shrink-0 lg:block">
        <LeftSidebar
          user={currentUser}
          chats={chatHistory}
          tools={tools}
          activeChatId={activeChatId}
          ledgerStatus={ledgerStatus}
          onConnectLedger={connectLedger}
          onDisconnectLedger={disconnectLedger}
          onNewChat={() => {
            resetChat();
            setActiveChatId(undefined);
          }}
          onSelectChat={(id) => setActiveChatId(id)}
          onSelectTool={() => {}}
        />
      </div>

      {/* Center */}
      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        <ChatWindow
          user={currentUser}
          messages={messages}
          quickActions={quickActions}
          ledgerStatus={ledgerStatus}
          approvalPanel={approvalPanel}
          onSend={sendMessage}
          onConnectLedger={connectLedger}
          onDisconnectLedger={disconnectLedger}
          onOpenLeft={() => setLeftOpen(true)}
          onOpenRight={() => setRightOpen(true)}
        />
      </main>

      {/* Desktop right */}
      <div className="hidden h-full w-[340px] shrink-0 xl:block">
        <RightSidebar
          wallet={wallet}
          recent={recentTransactions}
          ledgerStatus={ledgerStatus}
          onConnectLedger={connectLedger}
          onDisconnectLedger={disconnectLedger}
        />
      </div>

      {/* Mobile drawers */}
      <AnimatePresence>
        {leftOpen ? (
          <Drawer side="left" onClose={() => setLeftOpen(false)}>
            <LeftSidebar
              user={currentUser}
              chats={chatHistory}
              tools={tools}
              activeChatId={activeChatId}
              ledgerStatus={ledgerStatus}
              onConnectLedger={connectLedger}
              onDisconnectLedger={disconnectLedger}
              onNewChat={() => {
                resetChat();
                setLeftOpen(false);
              }}
              onSelectChat={(id) => {
                setActiveChatId(id);
                setLeftOpen(false);
              }}
              onSelectTool={() => setLeftOpen(false)}
            />
          </Drawer>
        ) : null}
        {rightOpen ? (
          <Drawer side="right" onClose={() => setRightOpen(false)}>
            <RightSidebar
              wallet={wallet}
              recent={recentTransactions}
              ledgerStatus={ledgerStatus}
              onConnectLedger={connectLedger}
              onDisconnectLedger={disconnectLedger}
            />
          </Drawer>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Drawer({
  side,
  onClose,
  children,
}: {
  side: "left" | "right";
  onClose: () => void;
  children: React.ReactNode;
}) {
  const x = side === "left" ? "-100%" : "100%";
  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x }}
        animate={{ x: 0 }}
        exit={{ x }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className={[
          "relative z-10 h-full w-[300px] max-w-[85vw] bg-background shadow-2xl",
          side === "left" ? "mr-auto" : "ml-auto",
        ].join(" ")}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.05] text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
