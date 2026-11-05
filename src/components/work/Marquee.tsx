/** Endless band of words, separated by small gold diamonds. */
export function Marquee({ items }: { items: string[] }) {
  const row = (
    <div className="marquee__row">
      {items.map((t) => (
        <span key={t}>
          {t}
          <i aria-hidden="true" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-label={items.join(', ')}>
      <div className="marquee__track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}
