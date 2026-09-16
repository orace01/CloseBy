CREATE TYPE "public"."agent_stage" AS ENUM('pending', 'done', 'skipped');--> statement-breakpoint
DROP INDEX "prospect_campaign_id_index";--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "search_tags" text[];--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "sourced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "fact" ADD COLUMN "quote" text;--> statement-breakpoint
ALTER TABLE "prospect" ADD COLUMN "stage" "agent_stage" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "prospect" ADD COLUMN "skip_reason" text;--> statement-breakpoint
ALTER TABLE "prospect" ADD COLUMN "relevance" integer;--> statement-breakpoint
CREATE INDEX "prospect_campaign_id_stage_index" ON "prospect" USING btree ("campaign_id","stage");