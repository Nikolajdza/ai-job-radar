import { describe, expect, it } from "vitest";
import { paginationItems } from "@/lib/jobs/pagination";

describe("paginationItems", () => {
  it("lists every page when there are only a few", () => {
    expect(paginationItems(1, 2)).toEqual([1, 2]);
    expect(paginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps the ends and a window around the current page", () => {
    expect(paginationItems(1, 12)).toEqual([1, 2, 3, "gap", 12]);
    expect(paginationItems(6, 12)).toEqual([1, "gap", 4, 5, 6, 7, 8, "gap", 12]);
    expect(paginationItems(12, 12)).toEqual([1, "gap", 10, 11, 12]);
  });
});
