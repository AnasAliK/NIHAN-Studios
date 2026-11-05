/** Small line-art version of the Hidden Gate, used in the header and loader. */
export function GateMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 52" fill="none" aria-hidden="true">
      <path className="gate-mark__arch" d="M8 50 V24 C8 15 18 13 20 2 C22 13 32 15 32 24 V50" />
      <path className="gate-mark__door" d="M16 50 V31 C16 27 19 26 20 20 C21 26 24 27 24 31 V50 Z" />
    </svg>
  );
}
