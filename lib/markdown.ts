import { Marked } from "marked";

const VIDEO_FILE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

/** Video links are written like images in the text: ![caption](https://…/clip.mp4) or a YouTube / Vimeo link. */
export function videoEmbed(href: string): { kind: "file" | "iframe"; src: string } | null {
  if (VIDEO_FILE.test(href)) return { kind: "file", src: href };
  const yt = href.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = href.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return null;
}

export const isVideoUrl = (href: string) => !!videoEmbed(href);

// Shared by the site and the editor preview. Content is written only by the signed-in owner, so it isn't sanitized.
const marked = new Marked({
  gfm: true,
  renderer: {
    image({ href, text }) {
      const alt = text.replace(/"/g, "&quot;");
      const video = videoEmbed(href);
      if (video?.kind === "file") return `<span class="media-video"><video controls preload="metadata" playsinline src="${video.src}" aria-label="${alt}"></video></span>`;
      if (video) return `<span class="media-video"><iframe src="${video.src}" title="${alt || "Video"}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></span>`;
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
