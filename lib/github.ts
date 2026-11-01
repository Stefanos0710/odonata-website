// Commits for the landing page. Private repos need GITHUB_STATS_TOKEN (read-only) or GITHUB_TOKEN with access.
const OWNER = "Stefanos0710";
const TOKEN = process.env.GITHUB_STATS_TOKEN ?? process.env.GITHUB_TOKEN;
const MAX_PAGES = 20; // ponytail: 2000 commits per repo, raise if a repo outgrows it

export const REPOS = ["Odonata", "Odonata-backup", "Dawnwell-Website", "Dawnwell"];

export type RepoCommits = { name: string; dates: string[] };

async function commitDates(repo: string): Promise<string[] | null> {
  const dates: string[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/commits?per_page=100&page=${page}`, {
        headers: { Accept: "application/vnd.github+json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
        next: { revalidate: 3600 },
      });
      if (!res.ok) return page === 1 ? null : dates;
      const list = (await res.json()) as { commit: { author: { date: string } } }[];
      dates.push(...list.map((c) => c.commit.author.date));
      if (list.length < 100) break;
    }
    return dates;
  } catch {
    return null;
  }
}

/** Repos the API could not read (private without a token, renamed, offline) are left out. */
export async function getCommits(): Promise<RepoCommits[]> {
  const all = await Promise.all(REPOS.map(async (name) => ({ name, dates: await commitDates(name) })));
  return all.filter((r): r is RepoCommits => r.dates !== null);
}
