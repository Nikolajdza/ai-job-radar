import { describe, expect, it } from "vitest";
import { buildJobDedupeKey } from "@/lib/jobs/dedupe";

describe("buildJobDedupeKey", () => {
  it("normalizes company, title, and URL", () => {
    const key = buildJobDedupeKey({
      company: "  Signal Forge ",
      title: "TypeScript Engineer",
      sourceUrl: "https://Example.com/jobs/role/?utm=1#section",
    });

    expect(key).toBe(
      "signal forge::typescript engineer::https://example.com/jobs/role?utm=1",
    );
  });

  it("treats trailing slashes as the same path", () => {
    const a = buildJobDedupeKey({
      company: "Acme",
      title: "Engineer",
      sourceUrl: "https://jobs.example.com/role/",
    });
    const b = buildJobDedupeKey({
      company: "Acme",
      title: "Engineer",
      sourceUrl: "https://jobs.example.com/role",
    });

    expect(a).toBe(b);
  });
});
