import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/ui/Gallery';
import { SplitTitle } from '@/components/work/SplitTitle';
import { ParallaxCover } from '@/components/work/ParallaxCover';
import { portfolio, projectHref, projectSlug, sectionById, sectionHref, type SectionId } from '@/content/portfolio';

export const dynamicParams = false;

export function generateStaticParams() {
  return portfolio.flatMap((s) => s.projects.map((p) => ({ section: s.id, project: projectSlug(p) })));
}

type Props = { params: Promise<{ section: string; project: string }> };

async function find(params: Props['params']) {
  const { section: sid, project: slug } = await params;
  const section = sectionById[sid as SectionId];
  const index = section?.projects.findIndex((p) => projectSlug(p) === slug) ?? -1;
  return section && index >= 0 ? { section, project: section.projects[index], index } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await find(params);
  if (!found) return {};
  const { project } = found;
  return {
    title: `${project.title} — NIHĀN Studios`,
    description: project.summary,
    openGraph: { images: project.images.slice(0, 1) },
  };
}

export default async function ProjectPage({ params }: Props) {
  const found = await find(params);
  if (!found) notFound();
  const { section, project, index } = found;
  const portrait = project.orientation === 'portrait';
  const prev = section.projects[index - 1];
  const next = section.projects[index + 1];

  return (
    <>
      <section className={`project-hero${portrait ? ' project-hero--portrait' : ''}`}>
        {!portrait && project.images[0] && <ParallaxCover src={project.images[0]} alt={`${project.title} — cover`} />}
        {portrait && (
          <div className="project-hero__phones" aria-hidden="true">
            {project.images.slice(0, 5).map((src, k) => (
              <span key={src} className="phone" style={{ '--k': k - 2 } as React.CSSProperties}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </span>
            ))}
          </div>
        )}
        <div className="project-hero__content">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href={sectionHref(section.id)}>{section.name}</Link>
            <span>/</span>
            <span aria-current="page">{project.title}</span>
          </nav>
          <p className="eyebrow">
            {section.index}.{index + 1} — {project.type}
          </p>
          <SplitTitle text={project.title} />
        </div>
      </section>

      <main className="page page--project">
        <section className="project-intro" data-reveal>
          <p className="project-intro__summary">{project.summary}</p>
          <dl className="project-intro__meta">
            {project.engine && (
              <div><dt>Made with</dt><dd>{project.engine}</dd></div>
            )}
            {project.foundation && (
              <div><dt>Built on</dt><dd><Link href={project.foundation.href}>{project.foundation.title}</Link></dd></div>
            )}
            {project.status && (
              <div>
                <dt>Status</dt>
                <dd>{project.status}</dd>
              </div>
            )}
            {project.releaseDate && (
              <div>
                <dt>Full release</dt>
                <dd>{project.releaseDate}</dd>
              </div>
            )}
            {project.hackathon && (
              <div>
                <dt>Developed during</dt>
                <dd>{project.hackathon}</dd>
              </div>
            )}
            <div>
              <dt>Category</dt>
              <dd>
                <Link href={sectionHref(section.id)}>{section.name}</Link>
              </dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{project.type}</dd>
            </div>
            <div>
              <dt>Gallery</dt>
              <dd>{project.images.length} images</dd>
            </div>
            {project.repository && (
              <div>
                <dt>Source code</dt>
                <dd>
                  <a href={project.repository} target="_blank" rel="noopener noreferrer">
                    View repository ↗
                  </a>
                </dd>
              </div>
            )}
            {project.link && (
              <div>
                <dt>{project.linkLabel ? 'Design' : 'Live'}</dt>
                <dd>
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    {project.linkLabel ?? 'Visit project'} ↗
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {project.video && (
          <section className="page-block" aria-labelledby="project-video-title">
            <div className="page-block__head">
              <h2 className="page-block__title" id="project-video-title">Project video</h2>
            </div>
            <video
              className="project-video"
              aria-label={`${project.title} project video`}
              src={project.video}
              controls
              playsInline
              preload="metadata"
            />
          </section>
        )}

        <section className="page-block" aria-labelledby="gallery-title">
          <div className="page-block__head" data-reveal>
            <h2 className="page-block__title" id="gallery-title">
              {project.upcoming ? 'Concept art' : 'Gallery'}
            </h2>
            <span className="page-block__count">Click any image to enlarge</span>
          </div>
          <Gallery images={project.images} title={project.title} portrait={portrait} />
        </section>

        <nav className="pager" aria-label="More projects" data-reveal>
          {prev ? (
            <Link href={projectHref(section.id, prev)}>
              <span className="eyebrow">Previous</span>
              <span>← {prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          <Link href={sectionHref(section.id)} className="pager__all">
            All {section.name}
          </Link>
          {next ? (
            <Link href={projectHref(section.id, next)} className="pager__next">
              <span className="eyebrow">Next</span>
              <span>{next.title} →</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </>
  );
}
