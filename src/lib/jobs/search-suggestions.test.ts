import { describe, expect, it } from "vitest";
import { matchSearchSuggestions } from "@/lib/jobs/search-suggestions";

describe("matchSearchSuggestions", () => {
  it("returns defaults when input is empty", () => {
    expect(matchSearchSuggestions("").length).toBeGreaterThan(0);
  });

  it("matches frontend-related suggestions as the user types", () => {
    const matches = matchSearchSuggestions("front");
    expect(matches.some((item) => item.query === "frontend")).toBe(true);
  });

  it("matches react suggestions", () => {
    const matches = matchSearchSuggestions("rea");
    expect(matches.some((item) => item.query === "react")).toBe(true);
  });
});
