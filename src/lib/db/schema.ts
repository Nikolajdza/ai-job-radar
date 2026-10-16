import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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

/* -------------------------------------------------------------------------- */
/* Auth (Better Auth core schema)                                             */
/* -------------------------------------------------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Jobs                                                                       */
/* -------------------------------------------------------------------------- */

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
  /** Manual jobs are private to their creator; null = public catalog. */
  ownerUserId: text("owner_user_id").references(() => user.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One row per catalog refresh. Jobs created in the latest run show as New. */
export const catalogSyncs = pgTable("catalog_syncs", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: varchar("source", { length: 50 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  createdCount: integer("created_count").notNull().default(0),
});

/** Per-user pipeline state for a job (saved, status, notes). */
export const jobTracking = pgTable(
  "job_tracking",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    applicationStatus: applicationStatusEnum("application_status"),
    saved: boolean("saved").notNull().default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("job_tracking_user_job_idx").on(table.userId, table.jobId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Profiles                                                                   */
/* -------------------------------------------------------------------------- */

export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  headline: varchar("headline", { length: 300 }).notNull(),
  bio: text("bio"),
  /** Small data URL (client-resized) or https URL. */
  avatarUrl: text("avatar_url"),
  currentLocation: varchar("current_location", { length: 200 }),
  yearsOfExperience: integer("years_of_experience"),
  openToWork: boolean("open_to_work").notNull().default(true),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
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
  /** Plain-text CV content used as extra context for AI matching. */
  cvText: text("cv_text"),
  cvFileName: varchar("cv_file_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* AI outputs                                                                 */
/* -------------------------------------------------------------------------- */

/** One analysis per (job, user). Re-running analysis upserts this record. */
export const jobAnalyses = pgTable(
  "job_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
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
  },
  (table) => [
    uniqueIndex("job_analyses_job_user_idx").on(table.jobId, table.userId),
  ],
);

/** One cover letter draft per (job, user). */
export const coverLetters = pgTable(
  "cover_letters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 300 }).notNull(),
    content: text("content").notNull(),
    highlights: text("highlights").array().notNull().default([]),
    tone: varchar("tone", { length: 30 }).notNull(),
    language: varchar("language", { length: 10 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("cover_letters_job_user_idx").on(table.jobId, table.userId),
  ],
);

export type UserRow = typeof user.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type NewJobRow = typeof jobs.$inferInsert;
export type JobTrackingRow = typeof jobTracking.$inferSelect;
export type CandidateProfileRow = typeof candidateProfiles.$inferSelect;
export type NewCandidateProfileRow = typeof candidateProfiles.$inferInsert;
export type JobAnalysisRow = typeof jobAnalyses.$inferSelect;
export type CoverLetterRow = typeof coverLetters.$inferSelect;
