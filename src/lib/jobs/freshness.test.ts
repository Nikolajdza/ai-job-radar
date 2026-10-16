import { describe, expect, it } from "vitest";
import { isFromLatestSync } from "@/lib/jobs/freshness";

const syncStart = new Date("2026-10-16T07:00:00.000Z");

describe("isFromLatestSync", () => {
  it("marks remotive jobs created with the latest refresh", () => {
    expect(
      isFromLatestSync(
        { source: "remotive", createdAt: "2026-10-16T07:00:00.000Z" },
        syncStart,
      ),
    ).toBe(true);
    expect(
      isFromLatestSync(
        { source: "remotive", createdAt: "2026-10-16T07:00:02.000Z" },
        syncStart,
      ),
    ).toBe(true);
  });

  it("leaves older remotive jobs and manual jobs unmarked", () => {
    expect(
      isFromLatestSync(
        { source: "remotive", createdAt: "2026-10-15T07:00:00.000Z" },
        syncStart,
      ),
    ).toBe(false);
    expect(
      isFromLatestSync(
        { source: "manual", createdAt: "2026-10-16T07:00:02.000Z" },
        syncStart,
      ),
    ).toBe(false);
    expect(
      isFromLatestSync(
        { source: "remotive", createdAt: "2026-10-16T07:00:02.000Z" },
        null,
      ),
    ).toBe(false);
  });
});
