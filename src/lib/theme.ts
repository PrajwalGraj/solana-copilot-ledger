export const colors = {
  background: "#050816",
  surface: "#0B1020",
  card: "#101827",
  border: "rgba(255,255,255,0.08)",
  primary: "#8B5CF6",
  solanaGreen: "#14F195",
  solanaPurple: "#9945FF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  text: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",
} as const;

export const gradients = {
  solana: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
  primary: "linear-gradient(135deg, #9945FF 0%, #8B5CF6 50%, #14F195 100%)",
} as const;

export type ColorToken = keyof typeof colors;