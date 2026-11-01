// Commit counts for the landing page. Private repos need GITHUB_STATS_TOKEN (read-only) or GITHUB_TOKEN with access.
const OWNER = "Stefanos0710";
const TOKEN = process.env.GITHUB_STATS_TOKEN ?? process.env.GITHUB_TOKEN;

export const REPOS = ["Odonata", "Odonata-backup", "Dawnwell-Website", "Dawnwell"];

export type RepoCount = { name: string; commits: number };

async function countCommits(repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/commits?per_page=1`, {
      headers: { Accept: "application/vnd.github+json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    // With one commit per page, the page number of rel="last" is the commit count.
    const last = res.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/);
    return last ? Number(last[1]) : ((await res.json()) as unknown[]).length;
  } catch {
    return null;
  }
}

/** Repos the API could not read (private without a token, renamed, offline) are left out. */
export async function getCommitCounts(): Promise<RepoCount[]> {
  const counts = await Promise.all(REPOS.map(async (name) => ({ name, commits: await countCommits(name) })));
  return counts.filter((c): c is RepoCount => c.commits !== null);
}
