import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import { Report } from "@/lib/pdf/report";
import type { CheckResult } from "@/lib/checks/types";

export const runtime = "nodejs";

const Body = z.object({
  owner: z.string(),
  repo: z.string(),
  results: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.enum(["PASS", "WARN", "FAIL"]),
      message: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { owner, repo, results } = Body.parse(json);

    const element = Report({ owner, repo, results: results as CheckResult[] });
    const buffer = await renderToBuffer(element);
    const body = new Uint8Array(buffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="nextcheck-${owner}-${repo}.pdf"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF failed" },
      { status: 500 }
    );
  }
}
