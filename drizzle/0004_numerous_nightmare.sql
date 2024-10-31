ALTER TABLE "albums" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp;
