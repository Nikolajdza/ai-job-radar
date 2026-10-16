import { describe, expect, it } from "vitest";
import { createJobSchema } from "@/lib/validation/job";

describe("createJobSchema", () => {
  it("accepts a valid job payload", () => {
    const parsed = createJobSchema.parse({
      title: "Frontend Engineer",
      company: "Acme",
      location: "Belgrade",
      workFormat: "remote",
      salary: "",
      description: "Build React and TypeScript features for customers.",
      sourceUrl: "https://example.com/jobs/acme-frontend",
      saved: true,
    });

    expect(parsed.salary).toBeNull();
    expect(parsed.saved).toBe(true);
  });

  it("rejects short descriptions and invalid URLs", () => {
    const result = createJobSchema.safeParse({
      title: "X",
      company: "Y",
      location: "Z",
      workFormat: "remote",
      description: "too short",
      sourceUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });
});
