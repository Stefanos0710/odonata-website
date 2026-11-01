import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { videoMode } from "@/lib/video-mode";
import { EntryForm } from "../entry-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New entry", robots: { index: false } };

export default async function NewEntry() {
  if (!(await isAdmin())) redirect("/admin");
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }); // YYYY-MM-DD
  return (
    <div className="admin">
      <EntryForm folder={`entry-${Date.now().toString(36)}`} initial={{ date: today }} videoMode={videoMode} />
    </div>
  );
}
