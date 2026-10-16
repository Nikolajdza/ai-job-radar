import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const workFormatEnum = pgEnum("work_format", [
  "remote",
  "hybrid",
  "onsite",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "interesting",
  "to_apply",
  "applied",
  "interview",
  "rejected",
  "offer",
]);

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  company: varchar("company", { length: 200 }).notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  workFormat: workFormatEnum("work_format").notNull(),
  salary: varchar("salary", { length: 100 }),
  description: text("description").notNull(),
  sourceUrl: text("source_url").notNull(),
  /** Origin of the listing: manual entry, Remotive sync, or n8n ingest. */
  source: varchar("source", { length: 50 }).notNull().default("manual"),
  /** Normalized key for duplicate detection (company + title + source). */
  dedupeKey: varchar("dedupe_key", { length: 500 }).notNull().unique(),
  applicationStatus: applicationStatusEnum("application_status"),
  matchScore: integer("match_score"),
  saved: boolean("saved").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Single-row candidate profile for this personal app.
 * Milestone 2 keeps one editable profile; multi-user auth comes later if needed.
 */
export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  headline: varchar("headline", { length: 300 }).notNull(),
  experienceSummary: text("experience_summary").notNull(),
  skills: text("skills").array().notNull().default([]),
  preferredTechnologies: text("preferred_technologies")
    .array()
    .notNull()
    .default([]),
  targetRoles: text("target_roles").array().notNull().default([]),
  locationPreferences: text("location_preferences")
    .array()
    .notNull()
    .default([]),
  workFormatPreferences: text("work_format_preferences")
    .array()
    .notNull()
    .default([]),
  salaryExpectation: varchar("salary_expectation", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * One analysis row per job. Re-running analysis upserts this record.
 */
export const jobAnalyses = pgTable("job_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" })
    .unique(),
  matchScore: integer("match_score").notNull(),
  matchingSkills: text("matching_skills").array().notNull().default([]),
  missingSkills: text("missing_skills").array().notNull().default([]),
  requiredQualifications: text("required_qualifications")
    .array()
    .notNull()
    .default([]),
  preferredQualifications: text("preferred_qualifications")
    .array()
    .notNull()
    .default([]),
  seniorityCompatibility: text("seniority_compatibility").notNull(),
  concerns: text("concerns").array().notNull().default([]),
  uncertainties: text("uncertainties").array().notNull().default([]),
  explanation: text("explanation").notNull(),
  cvSuggestions: text("cv_suggestions").array().notNull().default([]),
  provider: varchar("provider", { length: 50 }).notNull(),
  model: varchar("model", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type JobRow = typeof jobs.$inferSelect;
export type NewJobRow = typeof jobs.$inferInsert;
export type CandidateProfileRow = typeof candidateProfiles.$inferSelect;
export type NewCandidateProfileRow = typeof candidateProfiles.$inferInsert;
export type JobAnalysisRow = typeof jobAnalyses.$inferSelect;

