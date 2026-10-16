import { describe, expect, it } from "vitest";
import { matchSearchSuggestions } from "@/lib/jobs/search-suggestions";

const jobs = [
  { title: "Senior React Engineer", company: "Northwind" },
  { title: "Backend Python Developer", company: "Lemon.io" },
  { title: "Staff Frontend Engineer", company: "Northwind" },
];

describe("matchSearchSuggestions", () => {
  it("returns defaults when input is empty", () => {
    expect(matchSearchSuggestions("").length).toBeGreaterThan(0);
  });

  it("completes a skill from the first letters", () => {
    const matches = matchSearchSuggestions("rea", jobs);
    expect(matches[0]?.query).toBe("react");
    expect(matches[0]?.kind).toBe("skill");
  });

  it("offers the company and the matching title while typing", () => {
    const matches = matchSearchSuggestions("lem", jobs);
    expect(matches.some((item) => item.kind === "company" && item.query === "Lemon.io")).toBe(
      true,
    );

    const titles = matchSearchSuggestions("sen", jobs);
    expect(titles[0]?.query).toBe("senior");
    expect(titles.some((item) => item.kind === "title")).toBe(true);
  });

  it("hides skills that are not on the current board", () => {
    const matches = matchSearchSuggestions("rust", jobs);
    expect(matches).toHaveLength(0);
  });
});
