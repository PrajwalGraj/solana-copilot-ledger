import { Send } from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import type { QuickAction } from "@/types";
import { strings } from "@/data/mockData";

interface ChatInputBarProps {
  quickActions: QuickAction[];
  onSend: (text: string) => void;
}

export function ChatInputBar({ quickActions, onSend }: ChatInputBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const createTokenTemplate = `Create Token
Name:
Symbol:
Decimals: 9
Supply: 1000000`;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim()) return;
      onSend(value);
      setValue("");
    }
  }

  return (
    <div className="sticky bottom-0 z-10 mt-4 w-full">
      <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent" />
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                if (q.id === "create-token") {
                  setValue(createTokenTemplate);
                  window.requestAnimationFrame(() => inputRef.current?.focus());
                  return;
                }

                onSend(q.prompt);
              }}
              type="button"
              className="rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
            >
              {q.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="glass-card flex gap-2 rounded-2xl p-2 pl-5">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={strings.inputPlaceholder}
            rows={4}
            className="min-h-[96px] flex-1 resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-muted-strong focus:outline-none"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!value.trim()}
            className="mt-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full solana-gradient text-white shadow-lg shadow-primary/40 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
        <p className="text-center text-[11px] text-muted-strong">{strings.footerNotice}</p>
      </div>
    </div>
  );
}