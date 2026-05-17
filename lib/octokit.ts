import { Octokit } from "@octokit/rest";

export function getOctokit() {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "nextcheck/0.1",
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

export async function listFilesByExtension(
  octokit: Octokit,
  owner: string,
  repo: string,
  pathPrefix: string,
  extensions: string[]
): Promise<string[]> {
  try {
    const repoInfo = await octokit.repos.get({ owner, repo });
    const defaultBranch = repoInfo.data.default_branch;
    const tree = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "true",
    });
    return tree.data.tree
      .filter((node) => node.type === "blob" && node.path)
      .map((node) => node.path as string)
      .filter((p) => p.startsWith(pathPrefix) && extensions.some((ext) => p.endsWith(ext)));
  } catch {
    return [];
  }
}

export async function countMatchesInFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  files: string[],
  pattern: RegExp,
  maxFiles: number = 20
): Promise<{ scanned: number; totalMatches: number }> {
  let scanned = 0;
  let totalMatches = 0;
  for (const file of files.slice(0, maxFiles)) {
    const content = await safeGetContent(octokit, owner, repo, file);
    if (content === null) continue;
    scanned++;
    const matches = content.match(pattern);
    if (matches) totalMatches += matches.length;
  }
  return { scanned, totalMatches };
}
