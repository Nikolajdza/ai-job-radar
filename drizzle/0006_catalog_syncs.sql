CREATE TABLE "catalog_syncs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(50) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"created_count" integer DEFAULT 0 NOT NULL
);
