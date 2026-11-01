import type { Metadata } from "next";
import Link from "next/link";
import { configProblem, isAdmin, totpEnabled } from "@/lib/auth";
import { getEntries } from "@/lib/journal";
import { phaseLabel } from "@/lib/phases";
import { formatDate, formatDuration } from "@/lib/markdown";
import { storageMode } from "@/lib/storage";
import { logout } from "./actions";
import { DraftList } from "./draft-list";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Journal admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!(await isAdmin())) return <div className="admin"><LoginForm totp={totpEnabled} problem={configProblem()} /></div>;

  const entries = getEntries().reverse();
  return (
    <div className="admin">
      <header className="admin-head">
        <h1>Journal admin</h1>
        <div className="admin-actions">
          <Link className="button" href="/admin/new">Write a new entry</Link>
          <form action={logout}><button className="button quiet">Sign out</button></form>
        </div>
      </header>
      <p className="admin-mode">
        {storageMode === "github"
          ? "Saving commits to GitHub. The live site updates about a minute later, once Vercel has redeployed."
          : "Local mode: saving writes files into this project folder. Commit and push them to publish."}
      </p>
      <DraftList />
      <h2 className="admin-sub">Published entries</h2>
      <ul className="admin-list">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link href={`/admin/edit/${e.slug}`}>
              <span className="entry-title">{e.title}</span>
              <span className="entry-meta">
                {formatDate(e.date)}, {formatDuration(e.minutes)}, {phaseLabel(e.phase)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
