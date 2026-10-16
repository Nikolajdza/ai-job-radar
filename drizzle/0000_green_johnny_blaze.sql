CREATE TYPE "public"."application_status" AS ENUM('interesting', 'to_apply', 'applied', 'interview', 'rejected', 'offer');--> statement-breakpoint
CREATE TYPE "public"."work_format" AS ENUM('remote', 'hybrid', 'onsite');--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"headline" varchar(300) NOT NULL,
	"experience_summary" text NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"preferred_technologies" text[] DEFAULT '{}' NOT NULL,
	"target_roles" text[] DEFAULT '{}' NOT NULL,
	"location_preferences" text[] DEFAULT '{}' NOT NULL,
	"work_format_preferences" text[] DEFAULT '{}' NOT NULL,
	"salary_expectation" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"company" varchar(200) NOT NULL,
	"location" varchar(200) NOT NULL,
	"work_format" "work_format" NOT NULL,
	"salary" varchar(100),
	"description" text NOT NULL,
	"source_url" text NOT NULL,
	"dedupe_key" varchar(500) NOT NULL,
	"application_status" "application_status",
	"match_score" integer,
	"saved" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_dedupe_key_unique" UNIQUE("dedupe_key")
);
