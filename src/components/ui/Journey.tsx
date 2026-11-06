'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { portfolio, projectHref, sectionHref, site, type SectionId } from '@/content/portfolio';
import { PEAKS } from '@/lib/layout';
import { measureStops, STOPS } from '@/lib/journey';

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Text side for each portfolio stop — opposite the peak it describes. */
const ALIGN = Object.fromEntries(PEAKS.map((p) => [p.id, p.x < 0 ? 'right' : 'left'])) as Record<SectionId, 'left' | 'right'>;

export function Journey() {
  const root = useRef<HTMLElement>(null);

  // Panel fades, rail state and stop measurement — driven straight from scroll, no React renders.
  useEffect(() => {
    const sections = STOPS.map((id) => document.getElementById(id)!);
    const panels = sections.map((s) => s.querySelector<HTMLElement>('.panel'));
    const rail = STOPS.map((id) => document.querySelector<HTMLElement>(`.rail [data-stop="${id}"]`));
    const cue = document.querySelector<HTMLElement>('.scroll-cue');
    let raf = 0;

    const measure = () => measureStops();
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const tick = () => {
      const vh = window.innerHeight;
      let active = 0;
      let best = Infinity;
      sections.forEach((sec, i) => {
        const r = sec.getBoundingClientRect();
        const hold = Math.max(1, r.height - vh);
        const local = -r.top / hold;
        let o: number;
        if (i === 0) o = 1 - smooth(0.15, 0.75, local);
        else if (i === sections.length - 1) o = smooth(-0.35, 0.35, local);
        else o = smooth(-0.3, 0.12, local) * (1 - smooth(0.88, 1.3, local));
        const p = panels[i];
        if (p) {
          p.style.opacity = o.toFixed(3);
          const offset = sec.classList.contains('stop--portfolio') ? 0 : (1 - o) * (local < 0.5 ? 40 : -40);
          p.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
          p.style.visibility = o < 0.02 ? 'hidden' : 'visible';
        }
        const dist = Math.abs(local - 0.5);
        if (dist < best) {
          best = dist;
          active = i;
        }
      });
      rail.forEach((a, i) => a?.toggleAttribute('data-active', i === active));
      if (cue) cue.style.opacity = String(1 - smooth(0, 120, window.scrollY));
      document.documentElement.classList.toggle('is-beyond', active >= 3);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <main className="journey" ref={root}>
      <section className="stop stop--hero" id="hero" data-align="center">
        <div className="stop__sticky">
          <div className="panel panel--hero">
            <h1 className="hero__title">NIHĀN</h1>
            <p className="hero__studios">Studios</p>
            <p className="hero__arabic" lang="fa">
              <span />
              نهان
              <span />
            </p>
            <p className="hero__tagline">{site.tagline}</p>
          </div>
          <div className="scroll-cue">
            <span>Scroll to approach the gate</span>
            <i />
          </div>
        </div>
      </section>

      <section className="stop" id="manifesto" data-align="right">
        <div className="stop__sticky">
          <article className="panel panel--quote">
            <p className="kicker">
              نهان — <em>the hidden</em>
            </p>
            <blockquote>Beyond the visible world lies another — unseen, unexplored, and waiting to be discovered.</blockquote>
            <p className="lead">
              We are a studio of builders working at the edge of what is known. Beyond the gate, our work crowns the mountains.
            </p>
          </article>
        </div>
      </section>

      <section className="stop" id="threshold" data-align="center">
        <div className="stop__sticky">
          <article className="panel panel--threshold">
            <h2>NIHĀN exists at the threshold.</h2>
            <ul className="symbols">
              <li><b>The doorway</b> — between the known and the unknown.</li>
              <li><b>The light</b> — the search for understanding.</li>
              <li><b>The mountains</b> — the worlds beyond what we can see.</li>
              <li><b>The veil</b> — the secrets that conceal them.</li>
              <li><b>The darkness</b> — everything that remains undiscovered.</li>
            </ul>
            <p className="hint">Keep scrolling to step through</p>
          </article>
        </div>
      </section>

      {portfolio.map((s) => (
        <section className="stop stop--portfolio" id={s.id} key={s.id} data-align={ALIGN[s.id]}>
          <div className="stop__sticky">
            <article className="panel" data-lenis-prevent>
              <p className="panel__index">{s.index}</p>
              <p className="kicker">{s.kicker}</p>
              <h2>{s.name}</h2>
              <p>{s.intro}</p>
              {s.projects.length > 0 ? (
                <ul className="panel__projects" aria-label={`${s.name} projects`}>
                  {s.projects.map((p) => (
                    <li key={p.title}>
                      <Link href={projectHref(s.id, p)}>
                        <span>{p.title}</span>
                        <small>{p.type}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="tags">
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              <div className="panel__actions">
                <Link className="btn btn--solid" href={sectionHref(s.id)}>
                  Explore {s.nav}
                </Link>
                <span className="hint">{s.hint}</span>
              </div>
            </article>
          </div>
        </section>
      ))}

      <section className="stop stop--beyond" id="beyond" data-align="center">
        <div className="stop__sticky">
          <article className="panel panel--beyond">
            <p className="kicker">You have stepped through</p>
            <h2 className="beyond__title">{site.tagline}</h2>
            <p className="lead">{site.mission} Tell us about yours.</p>
            <div className="panel__actions panel__actions--center">
              <a className="btn btn--solid" href={`mailto:${site.email}`}>
                Begin a project
              </a>
              <a className="btn" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
            <footer className="footer">
              © {new Date().getFullYear()} NIHĀN Studios · <span lang="fa">نهان</span>
            </footer>
          </article>
        </div>
      </section>
    </main>
  );
}
