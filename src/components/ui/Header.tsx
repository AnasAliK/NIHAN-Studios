'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portfolio, sectionHref } from '@/content/portfolio';
import { scrollToStop } from '@/lib/journey';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  const home = pathname === '/';

  return (
    <header className={`nav${home ? '' : ' nav--solid'}`}>
      <Link
        className="nav__brand"
        href="/"
        aria-label="NIHĀN Studios — home"
        onClick={(e) => {
          if (home) {
            e.preventDefault();
            scrollToStop('hero');
          }
        }}
      >
        <Image className="nav__logo" src="/assets/brand/nihan-transparent.png" alt="NIHĀN Studios" width={96} height={96} priority />
      </Link>
      <nav className="nav__links" aria-label="Work">
        {portfolio.map((s) => (
          <Link key={s.id} href={sectionHref(s.id)} aria-current={pathname.startsWith(sectionHref(s.id)) ? 'page' : undefined}>
            {s.nav}
          </Link>
        ))}
        <Link
          className="nav__cta"
          href="/#beyond"
          onClick={(e) => {
            if (home) {
              e.preventDefault();
              scrollToStop('beyond');
            }
          }}
        >
          Contact
        </Link>
      </nav>
    </header>
  );
}
