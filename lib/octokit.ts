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
