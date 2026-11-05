'use client';

import { scrollToStop, STOPS, type StopId } from '@/lib/journey';

const LABELS: Record<StopId, string> = {
  hero: 'The Gate',
  manifesto: 'Nihān',
  threshold: 'Threshold',
  ai: 'AI',
  apps: 'Apps',
  games: 'Games',
  web: 'Websites',
  beyond: 'Beyond',
};

/** Journey progress dots. The active one is set by Journey's scroll loop via [data-active]. */
export function Rail() {
  return (
    <nav className="rail" aria-label="Journey progress">
      {STOPS.map((id) => (
        <a
          key={id}
          href={`#${id}`}
          data-stop={id}
          data-label={LABELS[id]}
          aria-label={LABELS[id]}
          onClick={(e) => {
            e.preventDefault();
            scrollToStop(id);
          }}
        />
      ))}
    </nav>
  );
}
