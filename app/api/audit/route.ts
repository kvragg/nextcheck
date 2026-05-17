import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAllChecks } from "@/lib/checks";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { url } = Body.parse(json);

    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
    if (!match) {
      return NextResponse.json(
        { error: "Not a valid GitHub URL. Expected: https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    const results = await runAllChecks({ owner, repo: repo.replace(/\.git$/, "") });

    return NextResponse.json({ owner, repo, results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Audit failed" },
      { status: 500 }
    );
  }
}
