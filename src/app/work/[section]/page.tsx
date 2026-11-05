import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { portfolio, projectHref, sectionById, sectionHref, site, type SectionId } from '@/content/portfolio';
import { SectionHero3D } from '@/components/work/SectionHero3D';
import { SplitTitle } from '@/components/work/SplitTitle';
import { TiltCard } from '@/components/work/TiltCard';
import { Marquee } from '@/components/work/Marquee';

export const dynamicParams = false;

export function generateStaticParams() {
  return portfolio.map((s) => ({ section: s.id }));
}

type Props = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = sectionById[(await params).section as SectionId];
  return s ? { title: `${s.name} — NIHĀN Studios`, description: s.intro } : {};
}

export default async function SectionPage({ params }: Props) {
  const section = sectionById[(await params).section as SectionId];
  if (!section) notFound();
  const i = portfolio.indexOf(section);
  const next = portfolio[(i + 1) % portfolio.length];
  const imageCount = section.projects.reduce((n, p) => n + p.images.length, 0);

  return (
    <main className="page">
      <section className="page-hero page-hero--split">
        <div className="page-hero__text">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span aria-current="page">{section.name}</span>
          </nav>
          <p className="eyebrow">
            {section.index} — {section.kicker}
          </p>
          <SplitTitle text={section.name} />
          <p className="page-hero__lead">{section.intro}</p>
          <dl className="stats">
            <div>
              <dt>Projects</dt>
              <dd>{String(section.projects.length).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>Screens</dt>
              <dd>{String(imageCount).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>Disciplines</dt>
              <dd>{String(section.tags.length).padStart(2, '0')}</dd>
            </div>
          </dl>
          <div className="page-hero__actions">
            <a className="btn btn--solid" href="#projects">
              See the work ↓
            </a>
            <a className="btn" href={`mailto:${site.email}?subject=${encodeURIComponent(section.name + ' project')}`}>
              Start a project
            </a>
          </div>
        </div>
        <SectionHero3D id={section.id} />
      </section>

      <Marquee items={[...section.tags, ...section.services.map((s) => s.title)]} />

      <section className="page-block" id="projects" aria-labelledby="projects-title">
        <div className="page-block__head" data-reveal>
          <h2 className="page-block__title" id="projects-title">
            Projects
          </h2>
          <span className="page-block__count">{section.projects.length} on this peak</span>
        </div>

        {section.projects.length === 0 && (
          <div className="empty" data-reveal>
            <div className="empty__glyph" aria-hidden="true" />
            <h3>Coming soon</h3>
            <p>New {section.name.toLowerCase()} work is on its way through the gate.</p>
          </div>
        )}

        <div className="project-list">
          {section.projects.map((p, k) => (
            <article className={`project-row${k % 2 ? ' project-row--flip' : ''}`} key={p.title} data-reveal>
              <TiltCard className="project-row__tilt">
                <Link
                  href={projectHref(section.id, p)}
                  className={`project-row__media${p.orientation === 'portrait' ? ' project-row__media--portrait' : ''}`}
                  aria-label={p.title}
                >
                  {p.orientation === 'portrait' ? (
                    p.images.slice(0, 3).map((src) => (
                      <span key={src} className="phone">
                        <Image src={src} alt="" fill sizes="(max-width: 768px) 30vw, 180px" />
                      </span>
                    ))
                  ) : (
                    <>
                      <Image src={p.images[0]} alt="" fill sizes="(max-width: 900px) 100vw, 55vw" />
                      {p.images[1] && (
                        <span className="project-row__peek">
                          <Image src={p.images[1]} alt="" fill sizes="20vw" />
                        </span>
                      )}
                    </>
                  )}
                  <span className="project-row__view">View project</span>
                </Link>
              </TiltCard>
              <div className="project-row__body">
                <p className="project-row__num">
                  {section.index}.{k + 1}
                </p>
                <h3>
                  <Link href={projectHref(section.id, p)}>{p.title}</Link>
                </h3>
                <p className="project-row__type">{p.type}</p>
                {p.hackathon && <p>Developed during the {p.hackathon}.</p>}
                {p.status && <p>{p.status}{p.releaseDate ? ` · Full release: ${p.releaseDate}` : ''}.</p>}
                <p>{p.summary}</p>
                <div className="project-row__thumbs" aria-hidden="true">
                  {p.images.slice(0, 4).map((src) => (
                    <span key={src} className={p.orientation === 'portrait' ? 'is-tall' : ''}>
                      <Image src={src} alt="" fill sizes="80px" />
                    </span>
                  ))}
                  {p.images.length > 4 && <em>+{p.images.length - 4}</em>}
                </div>
                <div className="project-row__actions">
                  <Link className="btn btn--arrow" href={projectHref(section.id, p)}>
                    Open project <span aria-hidden="true">→</span>
                  </Link>
                  {p.repository && (
                    <a className="btn" href={p.repository} target="_blank" rel="noopener noreferrer">
                      View repository ↗
                    </a>
                  )}
                  {p.link && (
                    <a className="btn" href={p.link} target="_blank" rel="noopener noreferrer">
                      {p.linkLabel ?? 'Visit project'} ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {section.services.length > 0 && (
        <section className="page-block" aria-labelledby="services-title">
          <div className="page-block__head" data-reveal>
            <h2 className="page-block__title" id="services-title">
              What we do
            </h2>
          </div>
          <div className="cards">
            {section.services.map((c, k) => (
              <div className="card" key={c.title} data-reveal style={{ '--d': `${k * 90}ms` } as React.CSSProperties}>
                <span className="card__num">0{k + 1}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link className="next-link" href={sectionHref(next.id)} data-reveal>
        <span className="eyebrow">Next peak · {next.index}</span>
        <span className="next-link__title">
          {next.name} <i aria-hidden="true">→</i>
        </span>
        <span className="next-link__kicker">{next.kicker}</span>
      </Link>
    </main>
  );
}
