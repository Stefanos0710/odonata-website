import { Marked } from "marked";

// Shared by the site and the editor preview. Content is written only by the signed-in owner, so it isn't sanitized.
const marked = new Marked({
  gfm: true,
  renderer: {
    image({ href, text }) {
      const alt = text.replace(/"/g, "&quot;");
      return `<a class="zoom" href="${href}"><img src="${href}" alt="${alt}" loading="lazy" decoding="async"></a>`;
    },
    link({ href, tokens }) {
      const external = /^https?:/.test(href);
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${this.parser.parseInline(tokens)}</a>`;
    },
  },
});

// Give each run of image lines its own paragraph, so captions written right above a photo stay in the text column.
const IMAGE_RUN = /^(?:[ \t]*!\[[^\]]*\]\([^)\s]+\)[ \t]*(?:\n|$))+/gm;

export const renderMarkdown = (md: string) =>
  marked.parse(md.replace(IMAGE_RUN, (run) => `\n\n${run.trim()}\n\n`), { async: false });

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" });
