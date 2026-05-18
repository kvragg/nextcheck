import { getOctokit, safeGetContent } from "@/lib/octokit";
import { pass, warn, type Check } from "./types";

export const DOCS_CHECKS: Check[] = [
  {
    id: "license-present",
    name: "LICENSE file present",
    category: "Docs & Compliance",
    severity: "INFO",
    why:
      "Without a LICENSE, the code is technically 'all rights reserved' — nobody can legally use, fork, or contribute. Open-source projects in particular need an explicit license to be reusable.",
    fix:
      "Add a LICENSE file. MIT, Apache 2.0, and BSD-3-Clause are the most common for OSS web projects.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const candidates = ["LICENSE", "LICENSE.md", "LICENSE.txt", "license", "COPYING"];
      for (const c of candidates) {
        const f = await safeGetContent(octo, owner, repo, c);
        if (f !== null) return pass("license-present", "LICENSE", `${c} present`);
      }
      return warn("license-present", "LICENSE", "No LICENSE file — code is 'all rights reserved' by default");
    },
  },
  {
    id: "readme-min",
    name: "README with basic structure",
    category: "Docs & Compliance",
    severity: "INFO",
    why:
      "A skeleton README (just the project name) signals abandoned project. Reviewers, hires, and contributors bounce immediately. A 5-section README is the minimum bar for a serious repo.",
    fix:
      "README should cover: what it is, why it exists, how to run locally, stack/architecture overview, contribution / license note.",
    async run({ owner, repo }) {
      const octo = getOctokit();
      const candidates = ["README.md", "Readme.md", "readme.md"];
      let content: string | null = null;
      let path = "";
      for (const c of candidates) {
        const f = await safeGetContent(octo, owner, repo, c);
        if (f !== null) {
          content = f;
          path = c;
          break;
        }
      }
      if (content === null) return warn("readme-min", "README", "No README file");
      const length = content.length;
      const headings = (content.match(/^#{1,3}\s/gm) ?? []).length;
      if (length < 200 || headings < 2) return warn("readme-min", "README", `${path}: ${length} chars, ${headings} headings — too thin for a serious project`);
      return pass("readme-min", "README", `${path}: ${length} chars, ${headings} headings`);
    },
  },
];
