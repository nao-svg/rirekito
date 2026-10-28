// リレキトのロゴマーク（書類に「リ」）。青い背景の上に置く前提で、背景は描かない
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="26 18 48 62" className={className} aria-hidden="true">
      <path d="M30 26a4 4 0 0 1 4-4H58L70 34V72a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4Z" fill="#fff" />
      <path d="M58 22V34H70Z" fill="#BFDBFE" />
      <path d="M41 38V54" stroke="#2563EB" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M43 68Q57 63 57 51V37" fill="none" stroke="#2563EB" strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}
