import React from "react";

type Props = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  monoLight?: boolean;
};

/**
 * GoldGround Capital logo.
 * Mark: layered mountain ridge with a sun/coin above, rendered in a gold gradient.
 * Designed original for GoldGround Capital — no third-party assets.
 */
export default function Logo({
  size = 36,
  withWordmark = true,
  className = "",
  monoLight = false,
}: Props) {
  const id = React.useId();
  const gradId = `gg-grad-${id}`;
  const shineId = `gg-shine-${id}`;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="GoldGround Capital"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={monoLight ? "#FFFFFF" : "#F0D773"} />
            <stop offset="55%" stopColor={monoLight ? "#FFFFFF" : "#C9A227"} />
            <stop offset="100%" stopColor={monoLight ? "#FFFFFF" : "#7A5E12"} />
          </linearGradient>
          <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer rounded square */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2"
        />

        {/* Sun / coin disc */}
        <circle cx="32" cy="22" r="6.5" fill={`url(#${gradId})`} />
        <circle cx="32" cy="22" r="6.5" fill="none" stroke="rgba(255,255,255,0.35)" />

        {/* Back mountain (lighter) */}
        <path
          d="M6 50 L22 30 L34 44 L46 28 L58 50 Z"
          fill={`url(#${gradId})`}
          opacity="0.55"
        />
        {/* Front mountain (darker, layered) */}
        <path
          d="M6 52 L20 36 L28 46 L40 32 L54 52 Z"
          fill={`url(#${gradId})`}
        />

        {/* Ground line */}
        <rect x="6" y="51" width="52" height="2" rx="1" fill={`url(#${gradId})`} />

        {/* Diagonal shine on the mark */}
        <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${shineId})`} opacity="0.35" />
      </svg>

      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-serif tracking-tight text-[1.05rem] font-semibold ${
              monoLight ? "text-white" : "text-ink-900"
            }`}
          >
            Gold<span className="text-gold-gradient">Ground</span>
          </span>
          <span
            className={`text-[0.66rem] uppercase tracking-[0.22em] mt-0.5 ${
              monoLight ? "text-cream-200" : "text-ink-500"
            }`}
          >
            Capital
          </span>
        </span>
      )}
    </span>
  );
}
