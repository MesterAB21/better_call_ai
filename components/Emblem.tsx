export default function Emblem({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="4 10 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Balance beam */}
      <line
        x1="14"
        y1="20"
        x2="34"
        y2="20"
        stroke="var(--gold-primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Balance pivot */}
      <line
        x1="24"
        y1="20"
        x2="24"
        y2="27"
        stroke="var(--gold-primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Balance pans */}
      <path
        d="M10 20 L7 25 H13 Z"
        stroke="var(--gold-primary)"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M38 20 L35 25 H41 Z"
        stroke="var(--gold-primary)"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Brain / circuit in center */}
      <path
        d="M19 30c0 -4 2 -5 5 -5s5 1 5 5c0 3 -2 4 -5 4s-5 -1 -5 -4Z"
        stroke="var(--silver-soft)"
        strokeWidth="1.6"
        fill="none"
      />
      <path
        d="M19 29c-2 0 -3 1 -3 2.5 0 1.5 1.5 2.2 3 2"
        stroke="var(--silver-soft)"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M29 29c2 0 3 1 3 2.5 0 1.5 -1.5 2.2 -3 2"
        stroke="var(--silver-soft)"
        strokeWidth="1.4"
        fill="none"
      />
      {/* Mallet handle hint on right */}
      <line
        x1="37"
        y1="34"
        x2="37"
        y2="40"
        stroke="var(--silver-soft)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect
        x="34.5"
        y="40"
        width="5"
        height="2.4"
        rx="1.2"
        stroke="var(--gold-primary)"
        strokeWidth="1.4"
      />
    </svg>
  );
}
