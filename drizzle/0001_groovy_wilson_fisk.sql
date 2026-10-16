CREATE TABLE "job_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"match_score" integer NOT NULL,
	"matching_skills" text[] DEFAULT '{}' NOT NULL,
	"missing_skills" text[] DEFAULT '{}' NOT NULL,
	"required_qualifications" text[] DEFAULT '{}' NOT NULL,
	"preferred_qualifications" text[] DEFAULT '{}' NOT NULL,
	"seniority_compatibility" text NOT NULL,
	"concerns" text[] DEFAULT '{}' NOT NULL,
	"uncertainties" text[] DEFAULT '{}' NOT NULL,
	"explanation" text NOT NULL,
	"cv_suggestions" text[] DEFAULT '{}' NOT NULL,
	"provider" varchar(50) NOT NULL,
	"model" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_analyses_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
ALTER TABLE "job_analyses" ADD CONSTRAINT "job_analyses_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;