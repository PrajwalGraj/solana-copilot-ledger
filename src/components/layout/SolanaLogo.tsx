interface SolanaLogoProps {
  size?: number;
}

export function SolanaLogo({ size = 32 }: SolanaLogoProps) {
  return (
    <div
      className="flex items-center justify-center rounded-xl solana-gradient"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.55}
        height={size * 0.55}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 7.5L8 5h11l-3 2.5H5zM5 12l3-2.5h11L16 12H5zM5 16.5L8 14h11l-3 2.5H5z"
          fill="white"
        />
      </svg>
    </div>
  );
}