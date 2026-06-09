import { motion } from "framer-motion";

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] rounded-2xl rounded-tr-md solana-gradient px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20">
        {content}
      </div>
    </motion.div>
  );
}