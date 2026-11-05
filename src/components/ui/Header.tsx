'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portfolio, sectionHref } from '@/content/portfolio';
import { scrollToStop } from '@/lib/journey';
import Image from 'next/image';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const home = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`nav${home ? '' : ' nav--solid'}`}>
      <Link
        className="nav__brand"
        href="/"
        aria-label="NIHĀN Studios — home"
        onClick={(e) => {
          setMenuOpen(false);
          if (home) {
            e.preventDefault();
            scrollToStop('hero');
          }
        }}
      >
        <Image className="nav__logo" src="/assets/brand/nihan-transparent.png" alt="NIHĀN Studios" width={96} height={96} priority />
      </Link>
      <div className="nav__actions">
        <button className="nav__toggle" type="button" aria-expanded={menuOpen} aria-controls="work-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      <nav id="work-navigation" className={`nav__links${menuOpen ? ' nav__links--open' : ''}`} aria-label="Work" onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false); }}>
        {portfolio.map((s) => (
          <Link key={s.id} href={sectionHref(s.id)} onClick={() => setMenuOpen(false)} aria-current={pathname.startsWith(sectionHref(s.id)) ? 'page' : undefined}>
            {s.nav}
          </Link>
        ))}
      </nav>
        <Link
          className="nav__cta"
          href="/#beyond"
          onClick={(e) => {
            setMenuOpen(false);
            if (home) {
              e.preventDefault();
              scrollToStop('beyond');
            }
          }}
        >
          Contact
        </Link>
      </div>
    </header>
  );
}
