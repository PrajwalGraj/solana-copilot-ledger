import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import type { ReactNode } from "react";

interface AssistantMessageProps {
  content?: string;
  details?: { label: string; value: string }[];
  followUp?: string;
  children?: ReactNode;
}

export function AssistantMessage({
  content,
  details,
  followUp,
  children,
}: AssistantMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex w-full gap-3"
    >
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
        <Sparkle className="h-4 w-4 text-primary" />
      </div>
      <div className="flex max-w-[85%] flex-1 flex-col gap-3">
        {(content || details || followUp) && (
          <div className="glass-card rounded-2xl px-4 py-3 text-sm text-foreground">
            {content ? <p className="leading-relaxed">{content}</p> : null}
            {details && details.length > 0 ? (
              <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl border border-border bg-white/[0.02] p-3 text-xs">
                {details.map((d) => (
                  <div key={d.label} className="contents">
                    <span className="text-muted-strong">{d.label}</span>
                    <span className="text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {followUp ? (
              <p className="mt-3 leading-relaxed text-muted-foreground">{followUp}</p>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}