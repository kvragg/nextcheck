import { Octokit } from "@octokit/rest";

let _cachedTree: { key: string; files: string[] } | null = null;

export function getOctokit() {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "nextcheck/0.4",
  });
}

export async function safeGetContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(res.data) || res.data.type !== "file") return null;
    if (!("content" in res.data)) return null;
    return Buffer.from(res.data.content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

export async function pathExists(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<boolean> {
  try {
    await octokit.repos.getContent({ owner, repo, path });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the entire file tree of the default branch once and cache it
 * per request. Avoids hammering the API for the 20+ checks that need it.
 */
export async function getFileTree(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string[]> {
  const key = `${owner}/${repo}`;
  if (_cachedTree && _cachedTree.key === key) return _cachedTree.files;

  try {
    const info = await octokit.repos.get({ owner, repo });
    const defaultBranch = info.data.default_branch;
    const tree = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "true",
    });
    const files = tree.data.tree
      .filter((n) => n.type === "blob" && n.path)
      .map((n) => n.path as string);
    _cachedTree = { key, files };
    return files;
  } catch {
    return [];
  }
}

export function filesByExt(
  files: string[],
  pathPrefix: string,
  exts: string[]
): string[] {
  return files.filter(
    (p) => p.startsWith(pathPrefix) && exts.some((e) => p.endsWith(e))
  );
}

export async function countMatchesInFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  files: string[],
  pattern: RegExp,
  maxFiles: number = 25
): Promise<{ scanned: number; totalMatches: number; sampleFile?: string }> {
  let scanned = 0;
  let totalMatches = 0;
  let sampleFile: string | undefined;
  for (const file of files.slice(0, maxFiles)) {
    const content = await safeGetContent(octokit, owner, repo, file);
    if (content === null) continue;
    scanned++;
    const matches = content.match(pattern);
    if (matches) {
      totalMatches += matches.length;
      if (!sampleFile) sampleFile = file;
    }
  }
  return { scanned, totalMatches, sampleFile };
}

export async function readAnyOf(
  octokit: Octokit,
  owner: string,
  repo: string,
  paths: string[]
): Promise<{ path: string; content: string } | null> {
  for (const p of paths) {
    const content = await safeGetContent(octokit, owner, repo, p);
    if (content !== null) return { path: p, content };
  }
  return null;
}

export function clearTreeCache() {
  _cachedTree = null;
}
