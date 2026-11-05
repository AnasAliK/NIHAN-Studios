import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { Lightbox } from '@/components/ui/Lightbox';
import { Cursor } from '@/components/ui/Cursor';
import { RouterBridge } from '@/components/ui/RouterBridge';
import { RevealObserver } from '@/components/work/Reveal';
import { portfolio, sectionHref, site } from '@/content/portfolio';

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="work">
      <div className="work__bg" aria-hidden="true">
        <span className="work__orb work__orb--a" />
        <span className="work__orb work__orb--b" />
      </div>
      <Header />
      {children}
      <footer className="site-footer">
        <div className="site-footer__cta" data-reveal>
          <p className="eyebrow">Begin a project</p>
          <h2>{site.mission}</h2>
          <a className="btn btn--solid btn--lg" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
        <div className="site-footer__bar">
          <Link href="/">← Return to the gate</Link>
          <nav aria-label="Work">
            {portfolio.map((s) => (
              <Link key={s.id} href={sectionHref(s.id)}>
                {s.nav}
              </Link>
            ))}
          </nav>
          <span>
            © {new Date().getFullYear()} NIHĀN Studios · <span lang="fa">نهان</span>
          </span>
        </div>
      </footer>
      <Lightbox />
      <Cursor />
      <RouterBridge />
      <RevealObserver />
    </div>
  );
}
