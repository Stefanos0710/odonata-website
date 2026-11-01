import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getEntry } from "@/lib/journal";
import { videoMode } from "@/lib/video-mode";
import { EntryForm } from "../../entry-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit entry", robots: { index: false } };

export default async function EditEntry({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const entry = getEntry((await params).slug);
  if (!entry) notFound();
  return (
    <div className="admin">
      <EntryForm
        folder={entry.slug}
        videoMode={videoMode}
        initial={{
          originalSlug: entry.slug,
          title: entry.title,
          date: new Date(entry.date).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }),
          minutes: entry.minutes,
          phase: entry.phase,
          cover: entry.cover,
          recordings: entry.recordings,
          body: entry.body,
        }}
      />
    </div>
  );
}
