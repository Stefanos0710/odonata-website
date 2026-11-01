import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntries, getEntry } from "@/lib/journal";
import { phaseLabel } from "@/lib/phases";
import { formatDate, formatDuration, renderMarkdown } from "@/lib/markdown";
import { SHARE_IMAGE } from "@/lib/site";
import { Lightbox } from "./lightbox";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => getEntries().map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getEntry((await params).slug);
  if (!entry) return {};
  // Nested openGraph replaces the root one entirely, so repeat what the card needs.
  const description = `Session from the Odonata build journal: ${formatDuration(entry.minutes)} of work on ${formatDate(entry.date)}.`;
  const images = entry.cover ? [{ url: entry.cover, alt: entry.title }] : [SHARE_IMAGE];
  return {
    title: entry.title,
    description,
    openGraph: { type: "article", siteName: "Odonata", title: entry.title, description, url: `/journal/${entry.slug}`, publishedTime: entry.date, images },
    twitter: { card: "summary_large_image", title: entry.title, description, images },
  };
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const all = getEntries();
  const i = all.findIndex((e) => e.slug === slug);
  const prev = all[i - 1];
  const next = all[i + 1];
  const words = entry.body.replace(/!\[[^\]]*\]\([^)]*\)/g, "").split(/\s+/).length;

  return (
    <article className="entry">
      <div className="read-progress" aria-hidden="true" />
      <header className="entry-head">
        <Link href={`/journal#${entry.phase}`} className="entry-phase">{phaseLabel(entry.phase)}</Link>
        <h1>{entry.title}</h1>
        <dl className="entry-facts">
          <div><dt>Session</dt><dd>{i + 1} of {all.length}</dd></div>
          <div><dt>Date</dt><dd>{formatDate(entry.date)}</dd></div>
          <div><dt>Time worked</dt><dd>{formatDuration(entry.minutes)}</dd></div>
          <div><dt>Reading time</dt><dd>{Math.max(1, Math.round(words / 220))} min</dd></div>
          {entry.images > 0 && <div><dt>Images</dt><dd>{entry.images}</dd></div>}
        </dl>
        <nav className="session-strip" aria-label="All sessions">
          {all.map((e, n) => (
            <Link
              key={e.slug}
              href={`/journal/${e.slug}`}
              title={`Session ${n + 1}: ${e.title}`}
              aria-label={`Session ${n + 1}: ${e.title}`}
              aria-current={n === i ? "page" : undefined}
              data-phase={e.phase === entry.phase || undefined}
            />
          ))}
        </nav>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.body) }} />
      <Lightbox />

      {entry.recordings.length > 0 && (
        <section className="recordings">
          <h2>Session recordings</h2>
          <p>Timelapse recordings of this session.</p>
          <div className="recording-grid">
            {entry.recordings.map((src) => (
              <video key={src} src={src} controls preload="none" playsInline />
            ))}
          </div>
        </section>
      )}

      <nav className="entry-nav" aria-label="More entries">
        {prev ? (
          <Link href={`/journal/${prev.slug}`} rel="prev">
            <span>Previous session</span>
            {prev.title}
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/journal/${next.slug}`} rel="next" className="next">
            <span>Next session</span>
            {next.title}
          </Link>
        )}
      </nav>
    </article>
  );
}
