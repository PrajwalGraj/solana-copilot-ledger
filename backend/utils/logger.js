export const logger = {
  info(message, meta) {
    console.log(`[backend] ${message}`, meta ?? "");
  },
  error(message, meta) {
    console.error(`[backend] ${message}`, meta ?? "");
  },
};
