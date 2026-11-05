/** Heading whose letters rise into place one after another (CSS only, server-rendered). */
export function SplitTitle({ text, className }: { text: string; className?: string }) {
  let i = 0;
  return (
    <h1 className={`split ${className ?? ''}`} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span className="split__word" key={w} aria-hidden="true">
          {[...word].map((ch) => (
            <span className="split__char" key={i} style={{ '--i': i++ } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
